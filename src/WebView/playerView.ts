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
        <div id="now-playing" class="now-playing empty">
            <div id="now-playing-title" class="title"></div>
            <div id="now-playing-artist" class="artist"></div>
        </div>

        <div class="controls">
            <button id="btn-previous" title="Anterior">⏮</button>
            <button id="btn-play-pause" class="primary" title="Reproducir / Pausar">⏯</button>
            <button id="btn-next" title="Siguiente">⏭</button>
        </div>

        <div class="volume-controls">
            <button id="btn-volume-down" title="Bajar volumen">🔉</button>
            <button id="btn-volume-up" title="Subir volumen">🔊</button>
        </div>

        <p class="hint">Controla el reproductor activo en Windows (Spotify, navegador, etc.)</p>
    </body>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
}
