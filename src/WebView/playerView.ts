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
        <div id="sessions-list" class="sessions-list">
            <p class="hint" id="empty-hint">No hay ninguna app reproduciendo audio en este momento.</p>
        </div>

        <div class="volume-controls">
            <span class="volume-label">Volumen general</span>
            <button id="btn-volume-down" title="Bajar volumen">🔉</button>
            <button id="btn-volume-up" title="Subir volumen">🔊</button>
        </div>

        <p class="hint">Cada sesión se controla por separado. La destacada es la que Windows considera activa.</p>
    </body>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
}
