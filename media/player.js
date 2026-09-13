// Este código corre DENTRO del webview del panel de reproductor
const vscode = acquireVsCodeApi();

function sendControl(command) {
    vscode.postMessage({ command });
}

document.getElementById('btn-previous')?.addEventListener('click', () => sendControl('mediaPrevious'));
document.getElementById('btn-play-pause')?.addEventListener('click', () => sendControl('mediaPlayPause'));
document.getElementById('btn-next')?.addEventListener('click', () => sendControl('mediaNext'));
document.getElementById('btn-volume-down')?.addEventListener('click', () => sendControl('mediaVolumeDown'));
document.getElementById('btn-volume-up')?.addEventListener('click', () => sendControl('mediaVolumeUp'));

window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command !== 'mediaInfo') {
        return;
    }

    const container = document.getElementById('now-playing');
    const titleEl = document.getElementById('now-playing-title');
    const artistEl = document.getElementById('now-playing-artist');

    if (!container || !titleEl || !artistEl) {
        return;
    }

    if (message.title) {
        titleEl.textContent = message.title;
        artistEl.textContent = message.artist || '';
        container.classList.remove('empty');
    } else {
        // Sin metadata disponible (SMTC sin sesión activa o falló): se ocultan
        // el título/artista y solo quedan los controles, sin mostrar un error.
        container.classList.add('empty');
    }
});
