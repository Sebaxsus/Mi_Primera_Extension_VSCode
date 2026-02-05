import * as vscode from 'vscode';
import { Timer } from './timer';
import { DataManager } from './dataManager';
import { AlarmManager } from './alarmManager';
import { MotivationalQuotes } from './motivationalQuotes';

import { getStatsHtml } from './WebView/dashboard';

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
            showStatsPanel(context);
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

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.testAlarm', async () => {
            await alarmManager.testAlarm();
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

function showStatsPanel(context: vscode.ExtensionContext) {
    const stats = dataManager.getStats();
    const todayMinutes = dataManager.getTodayMinutes();

    const today = new Date().toISOString().split('T')[0];
    const quote = quotes.getDailyQuote(today);

    const alarmData = alarmManager.getAlarmData();

    const panel = vscode.window.createWebviewPanel(
        'productivityStats',
        '📊 Estadísticas de Productividad',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'ejecutarAlarma':
                    // Aquí es donde el objeto de tu clase entra en acción
                    await alarmManager.testAlarm();
                    vscode.window.showInformationMessage('Alarma procesada');
                    return;
            }
        },
        undefined,
        context.subscriptions // Limpieza de memoria al cerra
    );

    panel.webview.html = getStatsHtml(stats, todayMinutes, alarmData, quote);
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
