import * as vscode from 'vscode';
import { DataManager } from '../dataManager';
import { AlarmManager } from '../alarmManager';
import { MotivationalQuotes } from '../motivationalQuotes';
import { getStatsHtml } from './dashboard';

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

    panel.webview.html = getStatsHtml(
        panel.webview,
        context.extensionUri,
        stats,
        todayMinutes,
        alarmData,
        quote
    );
}
