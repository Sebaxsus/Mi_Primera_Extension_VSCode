import type { AlarmData } from "../alarmManager"; // Se usa la plabra clave Type, para asegurar que al compilar el tipo no se agregue a este archivo
import type { UserStats, SessionData } from "../dataManager";
// TypeScript 3.8+ permite import type para asegurar que la importación sea solo para comprobación de tipos y no genere código.
import { getAchievementsHtml } from "./achievementsManager";
import { getNonce } from "./getNonce";
import * as vscode from 'vscode';

export function getStatsHtml(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    stats: UserStats,
    todayMinutes: number,
    alarmData: AlarmData,
    quote: string
): string {
    const config = vscode.workspace.getConfiguration('productivityTimer');

    const workMinutes = config.get<number>('workDuration', 30);
    const breakMinutes = config.get<number>('breakDuration', 10);
    const dailyMinimunMinutes = config.get<number>('minimumDailyMinutes', 30);
    const stretchMinutes = config.get<number>('stretchDuration', 5);

    const recentSessions = stats.sessions.slice(-7).reverse();
    const sessionsHtml = recentSessions.map((session: SessionData) => `
        <tr>
            <td>${session.date}</td>
            <td>${session.minutesWorked} min</td>
            <td>${session.sessionsCompleted}</td>
        </tr>
    `).join('');

    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'dashboard.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'dashboard.js'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estadísticas</title>
        <link rel="stylesheet" href="${styleUri}">
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

        <h1> Configuración Actual</h1>

        <div class="grid">
            <div class="stat-card">
                <div class="stat-header">Alarma</div>
                <div class="inline-list">
                    <div class="achievement">Nombre: ${alarmData.alarmName}</div>
                    <div class="achievement">Volumen: ${alarmData.volume} %</div>
                    <div class="achievement">Tipo: ${alarmData.alarmType}</div>
                </div>
                <button id="probar-alarma-btn" class="achievement">Probar</button>
            </div>
            <div class="stat-card">
                <div class="stat-header">Tiempo de Trabajo</div>
                <div class="stat-value">${workMinutes}</div>
                <div class="stat-label">minutos</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">Tiempo de Descanso</div>
                <div class="stat-value">${breakMinutes}</div>
                <div class="stat-label">minutos</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">Minimo Diario</div>
                <div class="stat-value">${dailyMinimunMinutes}</div>
                <div class="stat-label">minutos</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">Tiempo de Estiramiento</div>
                <div class="stat-value">${stretchMinutes}</div>
                <div class="stat-label">minutos</div>
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
                "${quote}"
            </p>
        </div>
    </body>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
}
