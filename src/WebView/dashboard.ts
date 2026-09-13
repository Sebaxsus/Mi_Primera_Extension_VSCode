import type { AlarmData } from "../alarmManager"; // Se usa la plabra clave Type, para asegurar que al compilar el tipo no se agregue a este archivo
import type { UserStats, SessionData } from "../dataManager";
// TypeScript 3.8+ permite import type para asegurar que la importación sea solo para comprobación de tipos y no genere código.
import { getAchievementsHtml } from "./achievementsManager";
import { getNonce } from "./getNonce";
import { getGeneralConfig } from "../configService";
import * as vscode from 'vscode';

function getSessionsHtml(stats: UserStats): string {
    const recentSessions = stats.sessions.slice(-7).reverse();
    const sessionsHtml = recentSessions.map((session: SessionData) => `
        <tr>
            <td>${session.date}</td>
            <td>${session.minutesWorked} min</td>
            <td>${session.sessionsCompleted}</td>
        </tr>
    `).join('');

    return sessionsHtml || '<tr><td colspan="3">No hay sesiones registradas</td></tr>';
}

/**
 * Arma el payload de datos que se manda tanto en el HTML inicial como en cada
 * refresco en vivo (`panelManager.refreshStatsPanel`), para no duplicar la
 * lógica de armado de datos en dos lugares.
 */
export interface DailyReminderStatus {
    enabled: boolean;
    time: string;
}

export function getDashboardData(
    stats: UserStats,
    todayMinutes: number,
    alarmData: AlarmData,
    quote: string,
    dailyReminder: DailyReminderStatus
) {
    const generalConfig = getGeneralConfig();

    return {
        stats: {
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            points: stats.points.toLocaleString(),
            totalHours: Math.floor(stats.totalMinutes / 60),
            todayMinutes,
            totalSessions: stats.totalSessions
        },
        alarmData,
        generalConfig,
        dailyReminder,
        achievementsHtml: getAchievementsHtml(stats),
        sessionsHtml: getSessionsHtml(stats),
        quote
    };
}

export function getStatsHtml(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    stats: UserStats,
    todayMinutes: number,
    alarmData: AlarmData,
    quote: string,
    dailyReminder: DailyReminderStatus
): string {
    const data = getDashboardData(stats, todayMinutes, alarmData, quote, dailyReminder);

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
                <div class="stat-value" id="stat-current-streak">${data.stats.currentStreak}</div>
                <div class="stat-label">días consecutivos</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">🏆 Mejor Racha</div>
                <div class="stat-value" id="stat-longest-streak">${data.stats.longestStreak}</div>
                <div class="stat-label">días consecutivos</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">⭐ Puntos Totales</div>
                <div class="stat-value" id="stat-points">${data.stats.points}</div>
                <div class="stat-label">puntos acumulados</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">⏱️ Tiempo Total</div>
                <div class="stat-value" id="stat-total-hours">${data.stats.totalHours}</div>
                <div class="stat-label">horas programadas</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">📅 Hoy</div>
                <div class="stat-value" id="stat-today-minutes">${data.stats.todayMinutes}</div>
                <div class="stat-label">minutos trabajados</div>
            </div>

            <div class="stat-card">
                <div class="stat-header">🍅 Sesiones</div>
                <div class="stat-value" id="stat-total-sessions">${data.stats.totalSessions}</div>
                <div class="stat-label">sesiones completadas</div>
            </div>
        </div>

        <h1>Configuración</h1>

        <div class="stat-card">
            <div class="stat-header">Alarma</div>
            <div class="config-form">
                <label>Tipo
                    <select id="alarm-type">
                        <option value="local">Archivo Local</option>
                        <option value="youtube">YouTube</option>
                        <option value="spotify">Spotify</option>
                    </select>
                </label>
                <label>Ruta / URL
                    <div class="inline-input">
                        <input type="text" id="alarm-path" placeholder="Ruta del archivo o URL">
                        <button id="pick-alarm-file-btn" title="Elegir archivo local">📂</button>
                    </div>
                </label>
                <label>Volumen (0-100)
                    <input type="number" id="alarm-volume" min="0" max="100">
                </label>
                <div class="config-actions">
                    <button id="save-alarm-btn" class="achievement">Guardar Alarma</button>
                    <button id="probar-alarma-btn" class="achievement">Probar</button>
                </div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">Tiempos</div>
            <div class="config-form">
                <label>Tiempo de Trabajo (min)
                    <input type="number" id="work-duration" min="1">
                </label>
                <label>Tiempo de Descanso (min)
                    <input type="number" id="break-duration" min="1">
                </label>
                <label>Mínimo Diario (min)
                    <input type="number" id="minimum-daily" min="1">
                </label>
                <label>Tiempo de Estiramiento (min)
                    <input type="number" id="stretch-duration" min="1">
                </label>
                <div class="config-actions">
                    <button id="save-general-btn" class="achievement">Guardar Tiempos</button>
                </div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">⏰ Recordatorio Diario</div>
            <div class="config-form">
                <p id="reminder-status">${data.dailyReminder.enabled
                    ? `Activo, se ejecuta todos los días a las ${data.dailyReminder.time} (incluso con VS Code cerrado, si tienes sesión iniciada en Windows).`
                    : 'No está activado. Se avisa vía Task Scheduler si no cumpliste tu mínimo diario.'}</p>
                <div class="config-actions">
                    <button id="enable-reminder-btn" class="achievement">${data.dailyReminder.enabled ? 'Cambiar Hora' : 'Activar'}</button>
                    <button id="disable-reminder-btn" class="achievement" ${data.dailyReminder.enabled ? '' : 'disabled'}>Desactivar</button>
                </div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">🏅 Logros Desbloqueados</div>
            <div id="achievements-container">${data.achievementsHtml}</div>
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
                <tbody id="sessions-table-body">
                    ${data.sessionsHtml}
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
    <script nonce="${nonce}">window.__initialData = ${JSON.stringify(data)};</script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
}
