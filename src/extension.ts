import * as vscode from 'vscode';
import { Timer } from './timer';
import { DataManager } from './dataManager';
import { AlarmManager } from './alarmManager';
import { MotivationalQuotes } from './motivationalQuotes';

let timer: Timer;
let dataManager: DataManager;
let alarmManager: AlarmManager;
let quotes: MotivationalQuotes;

export function activate(context: vscode.ExtensionContext) {
    console.log('Productivity Timer extension activada');

    // Inicializar componentes
    dataManager = new DataManager(context);
    alarmManager = new AlarmManager();
    quotes = new MotivationalQuotes();

    // Crear status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    context.subscriptions.push(statusBarItem);

    // Inicializar timer
    timer = new Timer(statusBarItem, alarmManager, dataManager);

    // Mostrar frase motivacional al iniciar
    showDailyMotivationalQuote();

    // Registrar comandos
    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.startWorkSession', () => {
            timer.startWork();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.startBreak', () => {
            timer.startBreak();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.stopTimer', () => {
            timer.stopTimer();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.setDailyLimit', async () => {
            await timer.setDailyLimit();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.showStats', () => {
            showStatsPanel();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.configure', async () => {
            await showConfigurationPanel();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.configureSound', async () => {
            await configureSoundAlarm();
        })
    );

    // Mostrar notificación de bienvenida
    const stats = dataManager.getStats();
    if (stats.currentStreak > 0) {
        vscode.window.showInformationMessage(
            `¡Bienvenido de vuelta! 🔥 Racha actual: ${stats.currentStreak} días | ⭐ Puntos: ${stats.points}`
        );
    }
}

function showDailyMotivationalQuote() {
    const today = new Date().toISOString().split('T')[0];
    const quote = quotes.getDailyQuote(today);
    
    vscode.window.showInformationMessage(quote, 'Ver Estadísticas').then(selection => {
        if (selection === 'Ver Estadísticas') {
            vscode.commands.executeCommand('productivityTimer.showStats');
        }
    });
}

function showStatsPanel() {
    const stats = dataManager.getStats();
    const todayMinutes = dataManager.getTodayMinutes();

    const panel = vscode.window.createWebviewPanel(
        'productivityStats',
        '📊 Estadísticas de Productividad',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getStatsHtml(stats, todayMinutes);
}

function getStatsHtml(stats: any, todayMinutes: number): string {
    const recentSessions = stats.sessions.slice(-7).reverse();
    const sessionsHtml = recentSessions.map((session: any) => `
        <tr>
            <td>${session.date}</td>
            <td>${session.minutesWorked} min</td>
            <td>${session.sessionsCompleted}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estadísticas</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 20px;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            .stat-card {
                background: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
                border: 1px solid var(--vscode-panel-border);
            }
            .stat-header {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .stat-value {
                font-size: 36px;
                font-weight: bold;
                color: var(--vscode-textLink-foreground);
            }
            .stat-label {
                font-size: 14px;
                color: var(--vscode-descriptionForeground);
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            th {
                background: var(--vscode-editor-inactiveSelectionBackground);
                font-weight: bold;
            }
            .achievement {
                display: inline-block;
                padding: 5px 15px;
                margin: 5px;
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border-radius: 15px;
                font-size: 12px;
            }
            .progress-bar {
                width: 100%;
                height: 20px;
                background: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 10px;
                overflow: hidden;
                margin-top: 10px;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #45a049);
                transition: width 0.3s ease;
            }
        </style>
    </head>
    <body>
        <h1>📊 Tus Estadísticas de Productividad</h1>
        
        <div class="grid">
            <div class="stat-card">
                <div class="stat-header">🔥 Racha Actual</div>
                <div class="stat-value">${stats.currentStreak}</div>
                <div class="stat-label">días consecutivos</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">🏆 Mejor Racha</div>
                <div class="stat-value">${stats.longestStreak}</div>
                <div class="stat-label">días consecutivos</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">⭐ Puntos Totales</div>
                <div class="stat-value">${stats.points.toLocaleString()}</div>
                <div class="stat-label">puntos acumulados</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">⏱️ Tiempo Total</div>
                <div class="stat-value">${Math.floor(stats.totalMinutes / 60)}</div>
                <div class="stat-label">horas programadas</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">📅 Hoy</div>
                <div class="stat-value">${todayMinutes}</div>
                <div class="stat-label">minutos trabajados</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">🍅 Sesiones</div>
                <div class="stat-value">${stats.totalSessions}</div>
                <div class="stat-label">sesiones completadas</div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">🏅 Logros Desbloqueados</div>
            ${getAchievementsHtml(stats)}
        </div>

        <div class="stat-card">
            <div class="stat-header">📆 Últimas Sesiones</div>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tiempo</th>
                        <th>Sesiones</th>
                    </tr>
                </thead>
                <tbody>
                    ${sessionsHtml || '<tr><td colspan="3">No hay sesiones registradas</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="stat-card">
            <div class="stat-header">💡 Frase Motivacional de Hoy</div>
            <p style="font-size: 18px; font-style: italic; margin-top: 10px;">
                "${quotes.getDailyQuote(new Date().toISOString().split('T')[0])}"
            </p>
        </div>
    </body>
    </html>`;
}

function getAchievementsHtml(stats: any): string {
    const achievements = [];

    if (stats.currentStreak >= 1) {
        achievements.push('<div class="achievement">🎯 Primera Racha</div>');
    }
    if (stats.currentStreak >= 7) {
        achievements.push('<div class="achievement">🌟 Semana Completa</div>');
    }
    if (stats.currentStreak >= 30) {
        achievements.push('<div class="achievement">👑 Mes Completo</div>');
    }
    if (stats.currentStreak >= 100) {
        achievements.push('<div class="achievement">💎 Centenario</div>');
    }
    if (stats.points >= 1000) {
        achievements.push('<div class="achievement">🏆 1K Puntos</div>');
    }
    if (stats.points >= 10000) {
        achievements.push('<div class="achievement">💰 10K Puntos</div>');
    }
    if (stats.totalSessions >= 50) {
        achievements.push('<div class="achievement">🎪 50 Sesiones</div>');
    }
    if (stats.totalSessions >= 100) {
        achievements.push('<div class="achievement">🚀 100 Sesiones</div>');
    }
    if (stats.totalMinutes >= 1000) {
        achievements.push('<div class="achievement">⏰ 1000 Minutos</div>');
    }

    return achievements.length > 0 
        ? achievements.join('') 
        : '<div class="stat-label">Completa sesiones para desbloquear logros</div>';
}

async function showConfigurationPanel() {
    const config = vscode.workspace.getConfiguration('productivityTimer');
    
    const workDuration = await vscode.window.showInputBox({
        prompt: 'Duración de sesión de trabajo (minutos)',
        value: config.get<number>('workDuration', 30).toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            return (isNaN(num) || num <= 0) ? 'Ingresa un número válido' : null;
        }
    });

    if (workDuration) {
        await config.update('workDuration', parseInt(workDuration), vscode.ConfigurationTarget.Global);
    }

    const breakDuration = await vscode.window.showInputBox({
        prompt: 'Duración de descanso (minutos)',
        value: config.get<number>('breakDuration', 10).toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            return (isNaN(num) || num <= 0) ? 'Ingresa un número válido' : null;
        }
    });

    if (breakDuration) {
        await config.update('breakDuration', parseInt(breakDuration), vscode.ConfigurationTarget.Global);
    }

    const minimumDaily = await vscode.window.showInputBox({
        prompt: 'Minutos mínimos diarios para mantener racha',
        value: config.get<number>('minimumDailyMinutes', 30).toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            return (isNaN(num) || num <= 0) ? 'Ingresa un número válido' : null;
        }
    });

    if (minimumDaily) {
        await config.update('minimumDailyMinutes', parseInt(minimumDaily), vscode.ConfigurationTarget.Global);
    }

    vscode.window.showInformationMessage('✅ Configuración guardada correctamente');
}

async function configureSoundAlarm() {
    const config = vscode.workspace.getConfiguration('productivityTimer');

    const alarmType = await vscode.window.showQuickPick(
        [
            { label: '🔊 Archivo Local', value: 'local' },
            { label: '🎵 YouTube', value: 'youtube' },
            { label: '🎧 Spotify', value: 'spotify' }
        ],
        { placeHolder: 'Selecciona el tipo de alarma' }
    );

    if (!alarmType) {
        return;
    }

    await config.update('alarmType', alarmType.value, vscode.ConfigurationTarget.Global);

    if (alarmType.value === 'local') {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'Audio': ['mp3', 'wav', 'ogg', 'm4a', 'aac']
            },
            openLabel: 'Seleccionar archivo de audio'
        });

        if (fileUri && fileUri[0]) {
            await config.update('alarmPath', fileUri[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('✅ Archivo de audio configurado');
        }
    } else if (alarmType.value === 'youtube') {
        const url = await vscode.window.showInputBox({
            prompt: 'Ingresa la URL de YouTube',
            placeHolder: 'https://www.youtube.com/watch?v=...',
            validateInput: (value) => {
                if (!value.includes('youtube.com') && !value.includes('youtu.be')) {
                    return 'Por favor ingresa una URL válida de YouTube';
                }
                return null;
            }
        });

        if (url) {
            await config.update('alarmPath', url, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(
                '✅ URL de YouTube configurada. Asegúrate de tener yt-dlp y ffmpeg instalados.'
            );
        }
    } else if (alarmType.value === 'spotify') {
        const uri = await vscode.window.showInputBox({
            prompt: 'Ingresa el URI de Spotify (opcional - spotify:track:...)',
            placeHolder: 'spotify:track:... o deja en blanco para reproducir lo que esté en pausa'
        });

        await config.update('alarmPath', uri || '', vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('✅ Spotify configurado como alarma');
    }

    // Configurar volumen
    const volume = await vscode.window.showInputBox({
        prompt: 'Volumen de la alarma (0-100)',
        value: config.get<number>('volume', 50).toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num < 0 || num > 100) {
                return 'Ingresa un número entre 0 y 100';
            }
            return null;
        }
    });

    if (volume) {
        await config.update('volume', parseInt(volume), vscode.ConfigurationTarget.Global);
    }

    // Probar alarma
    const test = await vscode.window.showQuickPick(['Sí', 'No'], {
        placeHolder: '¿Quieres probar la alarma?'
    });

    if (test === 'Sí') {
        await alarmManager.testAlarm();
    }
}

export function deactivate() {
    if (timer) {
        timer.dispose();
    }
}
