import type { AlarmData } from "../alarmManager"; // Se usa la plabra clave Type, para asegurar que al compilar el tipo no se agregue a este archivo
import type { UserStats, SessionData } from "../dataManager";
// TypeScript 3.8+ permite import type para asegurar que la importación sea solo para comprobación de tipos y no genere código.
import { getAchievementsHtml } from "./achievementsManager";

export function getStatsHtml(stats: UserStats, todayMinutes: number, alarmData: AlarmData, quote: string): string {
    const recentSessions = stats.sessions.slice(-7).reverse();
    const sessionsHtml = recentSessions.map((session: SessionData) => `
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
            <div class="stat-header">Alarma Actual</div>
            <div class="achievement">${alarmData.alarmName}</div>
            <div class="stat-label">Tipo: ${alarmData.alarmType}</div>
            <button class="achievement" onclick="solicitarPrueba()">Probar</button>
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
    <script>
        // Este código corre DENTRO del Webview
        const vscode = acquireVsCodeApi();

        function solicitarPrueba() {
            vscode.postMessage({
                command: 'ejecutarAlarma'
            });
        }
    </script>
    </html>`;
}