// Este código corre DENTRO del Webview
const vscode = acquireVsCodeApi();

const els = {
    currentStreak: document.getElementById('stat-current-streak'),
    longestStreak: document.getElementById('stat-longest-streak'),
    points: document.getElementById('stat-points'),
    totalHours: document.getElementById('stat-total-hours'),
    todayMinutes: document.getElementById('stat-today-minutes'),
    totalSessions: document.getElementById('stat-total-sessions'),
    achievements: document.getElementById('achievements-container'),
    sessionsBody: document.getElementById('sessions-table-body'),
    alarmType: document.getElementById('alarm-type'),
    alarmPath: document.getElementById('alarm-path'),
    alarmVolume: document.getElementById('alarm-volume'),
    workDuration: document.getElementById('work-duration'),
    breakDuration: document.getElementById('break-duration'),
    minimumDaily: document.getElementById('minimum-daily'),
    stretchDuration: document.getElementById('stretch-duration')
};

function applyData(data) {
    if (!data) {
        return;
    }

    if (data.stats) {
        els.currentStreak.textContent = data.stats.currentStreak;
        els.longestStreak.textContent = data.stats.longestStreak;
        els.points.textContent = data.stats.points;
        els.totalHours.textContent = data.stats.totalHours;
        els.todayMinutes.textContent = data.stats.todayMinutes;
        els.totalSessions.textContent = data.stats.totalSessions;
    }

    if (data.achievementsHtml !== undefined) {
        els.achievements.innerHTML = data.achievementsHtml;
    }

    if (data.sessionsHtml !== undefined) {
        els.sessionsBody.innerHTML = data.sessionsHtml;
    }

    if (data.alarmData) {
        els.alarmType.value = data.alarmData.alarmType;
        els.alarmPath.value = data.alarmData.alarmPath;
        els.alarmVolume.value = data.alarmData.volume;
    }

    if (data.generalConfig) {
        els.workDuration.value = data.generalConfig.workDuration;
        els.breakDuration.value = data.generalConfig.breakDuration;
        els.minimumDaily.value = data.generalConfig.minimumDailyMinutes;
        els.stretchDuration.value = data.generalConfig.stretchDuration;
    }
}

// Datos iniciales embebidos por dashboard.ts (evita un primer postMessage de ida y vuelta).
applyData(window.__initialData);

document.getElementById('probar-alarma-btn')?.addEventListener('click', () => {
    vscode.postMessage({ command: 'ejecutarAlarma' });
});

document.getElementById('save-alarm-btn')?.addEventListener('click', () => {
    vscode.postMessage({
        command: 'updateAlarmConfig',
        alarmType: els.alarmType.value,
        alarmPath: els.alarmPath.value,
        volume: parseInt(els.alarmVolume.value, 10)
    });
});

document.getElementById('pick-alarm-file-btn')?.addEventListener('click', () => {
    vscode.postMessage({ command: 'pickAlarmFile' });
});

document.getElementById('save-general-btn')?.addEventListener('click', () => {
    vscode.postMessage({
        command: 'updateGeneralConfig',
        workDuration: parseInt(els.workDuration.value, 10),
        breakDuration: parseInt(els.breakDuration.value, 10),
        minimumDailyMinutes: parseInt(els.minimumDaily.value, 10),
        stretchDuration: parseInt(els.stretchDuration.value, 10)
    });
});

window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.command) {
        case 'refresh':
            applyData(message.data);
            break;
        case 'alarmFilePicked':
            if (message.path) {
                els.alarmPath.value = message.path;
            }
            break;
    }
});
