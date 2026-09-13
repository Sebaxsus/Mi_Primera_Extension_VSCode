import * as vscode from 'vscode';
import { DataManager } from '../dataManager';
import { AlarmManager } from '../alarmManager';
import { MotivationalQuotes } from '../motivationalQuotes';
import { getStatsHtml, getDashboardData } from './dashboard';
import { showToast } from '../notify';
import { saveGeneralConfig, saveAlarmConfig } from '../configService';

let currentPanel: vscode.WebviewPanel | undefined;
let panelDeps: {
    dataManager: DataManager;
    alarmManager: AlarmManager;
    quotes: MotivationalQuotes;
} | undefined;

/**
 * Recalcula los datos del panel de Estadísticas y los empuja al webview ya
 * abierto vía `postMessage`, sin recrear el HTML (evita parpadeo y pérdida
 * de scroll/foco). No hace nada si el panel no está abierto.
 */
export function refreshStatsPanel(dataManager: DataManager, alarmManager: AlarmManager, quotes: MotivationalQuotes): void {
    if (!currentPanel) {
        return;
    }

    const stats = dataManager.getStats();
    const todayMinutes = dataManager.getTodayMinutes();
    const today = new Date().toISOString().split('T')[0];
    const quote = quotes.getDailyQuote(today);
    const alarmData = alarmManager.getAlarmData();

    const data = getDashboardData(stats, todayMinutes, alarmData, quote);
    currentPanel.webview.postMessage({ command: 'refresh', data });
}

/**
 * Crea y muestra el panel de estadísticas del webview, incluyendo el registro
 * del canal de mensajes webview -> extensión.
 */
export function createStatsPanel(
    context: vscode.ExtensionContext,
    dataManager: DataManager,
    alarmManager: AlarmManager,
    quotes: MotivationalQuotes
): void {
    panelDeps = { dataManager, alarmManager, quotes };

    if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.One);
        return;
    }

    const stats = dataManager.getStats();
    const todayMinutes = dataManager.getTodayMinutes();

    const today = new Date().toISOString().split('T')[0];
    const quote = quotes.getDailyQuote(today);

    const alarmData = alarmManager.getAlarmData();

    const panel = vscode.window.createWebviewPanel(
        'productivityStats',
        '📊 Estadísticas de Productividad',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        }
    );

    currentPanel = panel;
    panel.onDidDispose(() => {
        currentPanel = undefined;
    }, undefined, context.subscriptions);

    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'ejecutarAlarma':
                    await alarmManager.testAlarm();
                    showToast('Alarma procesada');
                    return;

                case 'updateAlarmConfig':
                    await saveAlarmConfig({
                        alarmType: message.alarmType,
                        alarmPath: message.alarmPath,
                        volume: message.volume
                    });
                    showToast('✅ Alarma guardada');
                    refreshStatsPanel(dataManager, alarmManager, quotes);
                    return;

                case 'updateGeneralConfig':
                    await saveGeneralConfig({
                        workDuration: message.workDuration,
                        breakDuration: message.breakDuration,
                        minimumDailyMinutes: message.minimumDailyMinutes,
                        stretchDuration: message.stretchDuration
                    });
                    showToast('✅ Tiempos guardados');
                    refreshStatsPanel(dataManager, alarmManager, quotes);
                    return;

                case 'pickAlarmFile': {
                    const fileUri = await vscode.window.showOpenDialog({
                        canSelectMany: false,
                        filters: { 'Audio': ['mp3', 'wav', 'ogg', 'm4a', 'aac'] },
                        openLabel: 'Seleccionar archivo de audio'
                    });

                    if (fileUri && fileUri[0]) {
                        panel.webview.postMessage({ command: 'alarmFilePicked', path: fileUri[0].fsPath });
                    }
                    return;
                }
            }
        },
        undefined,
        context.subscriptions // Limpieza de memoria al cerra
    );

    panel.webview.html = getStatsHtml(
        panel.webview,
        context.extensionUri,
        stats,
        todayMinutes,
        alarmData,
        quote
    );
}

/**
 * Refresca el panel activo (si existe) usando las dependencias registradas
 * en la última llamada a `createStatsPanel`. Pensado para invocarse desde
 * lugares que no tienen a mano `dataManager`/`alarmManager`/`quotes` (ej. `Timer`).
 */
export function refreshStatsPanelIfOpen(): void {
    if (panelDeps) {
        refreshStatsPanel(panelDeps.dataManager, panelDeps.alarmManager, panelDeps.quotes);
    }
}
