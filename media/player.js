// Este código corre DENTRO del webview del panel de reproductor
const vscode = acquireVsCodeApi();

const sessionsListEl = document.getElementById('sessions-list');
const emptyHintEl = document.getElementById('empty-hint');

// Sesión que el usuario eligió destacar manualmente (independiente de cuál
// considera Windows "activa"). Se pierde si esa sesión deja de existir.
let pinnedSessionId = null;
let lastSessions = [];

function sendVolumeControl(command) {
    vscode.postMessage({ command });
}

document.getElementById('btn-volume-down')?.addEventListener('click', () => sendVolumeControl('mediaVolumeDown'));
document.getElementById('btn-volume-up')?.addEventListener('click', () => sendVolumeControl('mediaVolumeUp'));

function sendSessionControl(sessionId, action) {
    vscode.postMessage({ command: 'sessionControl', sessionId, action });
}

function createButton(label, title, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.title = title;
    btn.addEventListener('click', (event) => {
        // Evita que el click en un botón de control también dispare el
        // "marcar como destacada" del contenedor de la sesión.
        event.stopPropagation();
        onClick();
    });
    return btn;
}

function renderSessions(sessions) {
    lastSessions = sessions || [];

    // Si la sesión destacada manualmente ya no existe, se vuelve a seguir
    // el criterio de Windows.
    if (pinnedSessionId && !lastSessions.some(s => s.id === pinnedSessionId)) {
        pinnedSessionId = null;
    }

    // Se limpia y se reconstruye la lista en cada actualización; son pocos
    // elementos (una app por sesión de audio activa), no hace falta un diff.
    sessionsListEl.innerHTML = '';

    if (lastSessions.length === 0) {
        sessionsListEl.appendChild(emptyHintEl || document.createTextNode('No hay ninguna app reproduciendo audio en este momento.'));
        return;
    }

    const isDisplayActive = (session) => pinnedSessionId ? session.id === pinnedSessionId : session.isActive;

    // La sesión destacada (elegida por el usuario, o la activa según Windows
    // si no eligió ninguna) va primero, seguida del resto.
    const ordered = [...lastSessions].sort((a, b) => (isDisplayActive(b) ? 1 : 0) - (isDisplayActive(a) ? 1 : 0));

    for (const session of ordered) {
        const item = document.createElement('div');
        item.className = 'session-item' + (isDisplayActive(session) ? ' active-session' : '');
        item.addEventListener('click', () => {
            pinnedSessionId = session.id;
            renderSessions(lastSessions);
        });

        const info = document.createElement('div');
        info.className = 'session-info';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = session.title || session.id;

        const artist = document.createElement('div');
        artist.className = 'artist';
        artist.textContent = session.artist || session.status || '';

        info.appendChild(title);
        info.appendChild(artist);

        const controls = document.createElement('div');
        controls.className = 'session-controls';
        controls.appendChild(createButton('⏮', 'Anterior', () => sendSessionControl(session.id, 'previous')));

        const isPlaying = session.status === 'Playing';
        controls.appendChild(createButton(
            isPlaying ? '⏸' : '▶',
            isPlaying ? 'Pausar' : 'Reanudar',
            () => sendSessionControl(session.id, isPlaying ? 'pause' : 'play')
        ));

        controls.appendChild(createButton('⏭', 'Siguiente', () => sendSessionControl(session.id, 'next')));

        item.appendChild(info);
        item.appendChild(controls);
        sessionsListEl.appendChild(item);
    }
}

window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'mediaSessions') {
        renderSessions(message.sessions);
    }
});
