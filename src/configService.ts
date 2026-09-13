import * as vscode from 'vscode';

/**
 * Lógica pura de lectura/escritura de `productivityTimer.*`, sin UI, para que
 * tanto los comandos nativos (`showConfigurationPanel`/`configureSoundAlarm`
 * en `extension.ts`) como el panel de Estadísticas (webview) guarden la
 * configuración de la misma forma, sin duplicar `config.update(...)`.
 */

export interface GeneralConfigValues {
    workDuration?: number;
    breakDuration?: number;
    minimumDailyMinutes?: number;
    stretchDuration?: number;
}

export interface AlarmConfigValues {
    alarmType?: string;
    alarmPath?: string;
    volume?: number;
}

async function updateConfig(key: string, value: unknown): Promise<void> {
    await vscode.workspace.getConfiguration('productivityTimer').update(key, value, vscode.ConfigurationTarget.Global);
}

export function getGeneralConfig() {
    const config = vscode.workspace.getConfiguration('productivityTimer');
    return {
        workDuration: config.get<number>('workDuration', 30),
        breakDuration: config.get<number>('breakDuration', 10),
        minimumDailyMinutes: config.get<number>('minimumDailyMinutes', 30),
        stretchDuration: config.get<number>('stretchDuration', 5),
        stretchVideos: config.get<string[]>('stretchVideos', [])
    };
}

export async function saveGeneralConfig(values: GeneralConfigValues): Promise<void> {
    if (values.workDuration !== undefined) {
        await updateConfig('workDuration', values.workDuration);
    }
    if (values.breakDuration !== undefined) {
        await updateConfig('breakDuration', values.breakDuration);
    }
    if (values.minimumDailyMinutes !== undefined) {
        await updateConfig('minimumDailyMinutes', values.minimumDailyMinutes);
    }
    if (values.stretchDuration !== undefined) {
        await updateConfig('stretchDuration', values.stretchDuration);
    }
}

export async function saveStretchVideos(urls: string[]): Promise<void> {
    await updateConfig('stretchVideos', urls);
}

export async function saveAlarmConfig(values: AlarmConfigValues): Promise<void> {
    if (values.alarmType !== undefined) {
        await updateConfig('alarmType', values.alarmType);
    }
    if (values.alarmPath !== undefined) {
        await updateConfig('alarmPath', values.alarmPath);
    }
    if (values.volume !== undefined) {
        await updateConfig('volume', values.volume);
    }
}
