import * as vscode from 'vscode';
import { Timer } from './timer';
import { DataManager } from './dataManager';
import { AlarmManager } from './alarmManager';
import { MotivationalQuotes } from './motivationalQuotes';

import { createStatsPanel } from './WebView/panelManager';
import { PlayerViewProvider } from './WebView/playerViewProvider';
import { SpotifyAuth } from './Spotify/auth';
import { showToast } from './notify';
import { saveGeneralConfig, saveStretchVideos, saveAlarmConfig } from './configService';
import { enableDailyReminder, disableDailyReminder } from './dailyReminderManager';

let timer: Timer;
let dataManager: DataManager;
let alarmManager: AlarmManager;
let quotes: MotivationalQuotes;
let spotify: SpotifyAuth;

export function activate(context: vscode.ExtensionContext) {
    console.log('Productivity Timer extension activada');

    // Inicializar componentes
    dataManager = new DataManager(context);
    alarmManager = new AlarmManager(context);
    quotes = new MotivationalQuotes();

    dataManager.checkStreak();
    dataManager.refreshDailyStatusFile();

    // Crear status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    context.subscriptions.push(statusBarItem);

    // Inicializar timer
    timer = new Timer(statusBarItem, alarmManager, dataManager, context);

    // Registrar el panel de reproductor (activity bar), reutilizando el mismo
    // MusicPlayer/proceso de PowerShell que ya usa la alarma.
    const playerProvider = new PlayerViewProvider(context.extensionUri, alarmManager.getMusicPlayer());
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('productivityTimer.playerView', playerProvider)
    );

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

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.enableDailyReminder', async () => {
            await enableDailyReminder(context, dataManager);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('productivityTimer.disableDailyReminder', async () => {
            await disableDailyReminder(context);
        })
    );

    // Mostrar notificación de bienvenida
    const stats = dataManager.getStats();

    if (stats.currentStreak > 0 || stats.longestStreak > 0) {
        showToast(`¡Bienvenido de vuelta! 🔥 Racha actual: ${stats.currentStreak} días | ⭐ Puntos: ${stats.points}`, 8000);
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
    createStatsPanel(context, dataManager, alarmManager, quotes);
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

    const breakDuration = await vscode.window.showInputBox({
        prompt: 'Duración de descanso (minutos)',
        value: config.get<number>('breakDuration', 10).toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            return (isNaN(num) || num <= 0) ? 'Ingresa un número válido' : null;
        }
    });

    const minimumDaily = await vscode.window.showInputBox({
        prompt: 'Minutos mínimos diarios para mantener racha',
        value: config.get<number>('minimumDailyMinutes', 30).toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            return (isNaN(num) || num <= 0) ? 'Ingresa un número válido' : null;
        }
    });

    const stretchDuration = await vscode.window.showInputBox({
        prompt: 'Duración de la etapa de estiramiento (minutos)',
        value: config.get<number>('stretchDuration', 5).toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            return (isNaN(num) || num <= 0) ? 'Ingresa un número válido' : null;
        }
    });

    const stretchVideos = await vscode.window.showInputBox({
        prompt: 'URLs de rutinas de estiramiento en YouTube, separadas por coma (vacío = usar la lista por defecto)',
        value: config.get<string[]>('stretchVideos', []).join(', '),
        ignoreFocusOut: true
    });

    await saveGeneralConfig({
        workDuration: workDuration ? parseInt(workDuration) : undefined,
        breakDuration: breakDuration ? parseInt(breakDuration) : undefined,
        minimumDailyMinutes: minimumDaily ? parseInt(minimumDaily) : undefined,
        stretchDuration: stretchDuration ? parseInt(stretchDuration) : undefined
    });
    dataManager.refreshDailyStatusFile();

    if (stretchVideos !== undefined) {
        const urls = stretchVideos.split(',').map(s => s.trim()).filter(Boolean);
        await saveStretchVideos(urls);
    }

    showToast('✅ Configuración guardada correctamente');
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

    await saveAlarmConfig({ alarmType: alarmType.value });

    if (alarmType.value === 'local') {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'Audio': ['mp3', 'wav', 'ogg', 'm4a', 'aac']
            },
            openLabel: 'Seleccionar archivo de audio'
        });

        if (fileUri && fileUri[0]) {
            await saveAlarmConfig({ alarmPath: fileUri[0].fsPath });
            showToast('✅ Archivo de audio configurado');
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
            await saveAlarmConfig({ alarmPath: url });
            showToast(
                '✅ URL de YouTube configurada. yt-dlp se descarga y verifica automáticamente (con tu confirmación) ' +
                'la primera vez que se use. En macOS/Linux además necesitas ffmpeg instalado para el audio; ' +
                'para ver el video de estiramiento reproducido dentro de la extensión, ffmpeg hace falta en cualquier sistema operativo.',
                10000
            );
        }
    } else if (alarmType.value === 'spotify') {
        const userHasSpotifyAPI = await vscode.window.showQuickPick([
            { label: "No", value: false},
            { label: "Si", value: true}
        ], {
            canPickMany: false,
            ignoreFocusOut: true,
            title:"Configuracion",
            prompt: "Ya tiene la api de Spotify?"
        });

        if (userHasSpotifyAPI) {

            const client_id = await vscode.window.showInputBox({
                prompt: 'Ingrese el Client ID de su API',
                placeHolder: "g9b1kbd13s5a41c8acc5b7c2028dbfba",
                ignoreFocusOut: true,
                validateInput: (value) => {
                    if (!value || value === "") {
                        return "Asegurese de ingresar su client_id";
                    }
                    return null;
                },
            });

            const client_secret = await vscode.window.showInputBox({
                prompt: 'Ingrese el Client Secret de su API',
                placeHolder: "g9b1kbd13s5a41c8acc5b7c2028dbfba",
                ignoreFocusOut: true,
                validateInput: (value) => {
                    if (!value || value === "") {
                        return "Asegurese de ingresar su client_secret";
                    }
                    return null;
                },
            });

            if (client_id && client_secret) {
                const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

                spotify = new SpotifyAuth(client_id, client_secret, "http://127.0.0.1:5000/callback/");

                const token = await spotify.auth();
                
                await dataManager.saveSpotifyData(token);
            }

            const uri = await vscode.window.showInputBox({
                prompt: 'Ingresa el URI de Spotify (opcional - spotify:track:...)',
                placeHolder: 'spotify:track:... o deja en blanco para reproducir lo que esté en pausa',
                ignoreFocusOut: true
            });
    
            await saveAlarmConfig({ alarmPath: uri || '' });
            showToast('✅ Spotify configurado como alarma');
        } else {
            vscode.window.showErrorMessage("❌ Spotify no puede ser configurado como reproductor de alarma\nPuede crear la API?\nDirigase a https://developer.spotify.com/ y verifique!");
        }

    }

    // Configurar volumen
    const volume = await vscode.window.showInputBox({
        prompt: 'Volumen de la alarma (0-100)',
        value: config.get<number>('volume', 50).toString(),
        ignoreFocusOut: true,
        validateInput: (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num < 0 || num > 100) {
                return 'Ingresa un número entre 0 y 100';
            }
            return null;
        }
    });

    if (volume) {
        await saveAlarmConfig({ volume: parseInt(volume) });
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
