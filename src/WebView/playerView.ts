import * as vscode from 'vscode';
import { getNonce } from './getNonce';

/**
 * Genera el HTML del panel de reproductor. El título/artista/estado no se
 * inyectan aquí: llegan en vivo vía `postMessage` (ver `playerViewProvider.ts`
 * y `media/player.js`), por lo que este HTML es estático.
 */
export function getPlayerHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'player.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'player.js'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reproductor</title>
        <link rel="stylesheet" href="${styleUri}">
    </head>
    <body>
        <div id="stretch-card" class="session-item stretch-card" hidden>
            <div class="session-info">
                <div class="title">🧘 Video de estiramiento</div>
                <div class="artist" id="stretch-status">Reproduciendo</div>
            </div>
            <div class="session-controls" id="stretch-controls">
                <button data-action="back" title="Retroceder 10 s">⏪</button>
                <button data-action="togglePause" id="stretch-pause" title="Pausar">⏸</button>
                <button data-action="forward" title="Adelantar 10 s">⏩</button>
                <button data-action="volDown" title="Bajar volumen del video">🔉</button>
                <button data-action="volUp" title="Subir volumen del video">🔊</button>
                <button data-action="mute" id="stretch-mute" title="Silenciar">🔇</button>
                <button data-action="fullscreen" title="Pantalla completa">⛶</button>
                <button data-action="stop" title="Cerrar video">⏹</button>
            </div>
        </div>

        <div id="sessions-list" class="sessions-list">
            <p class="hint" id="empty-hint">No hay ninguna app reproduciendo audio en este momento.</p>
        </div>

        <div class="volume-controls">
            <span class="volume-label">Volumen general</span>
            <button id="btn-volume-down" title="Bajar volumen">🔉</button>
            <button id="btn-volume-up" title="Subir volumen">🔊</button>
        </div>

        <p class="hint">Cada sesión se controla por separado. La destacada es la que Windows considera activa.</p>

        <div class="player-footer">
            <button id="btn-open-dashboard" title="Abrir Configuración">⚙️ Configuración</button>
        </div>
    </body>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
}
