import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { DataManager } from './dataManager';
import { showToast } from './notify';

const TASK_NAME = 'ProductivityTimerDailyReminder';

function runSchtasks(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        execFile('schtasks', args, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
                return;
            }
            resolve({ stdout, stderr });
        });
    });
}

function getReminderScriptPath(context: vscode.ExtensionContext): string {
    return path.join(context.globalStorageUri.fsPath, 'daily_reminder.ps1');
}

/**
 * Script standalone e independiente del proceso de la extensión: se ejecuta
 * vía Task Scheduler aunque VSCode esté cerrado. Lee el archivo sidecar que
 * escribe `DataManager` (no el estado interno de VSCode) y, si no se cumplió
 * la meta diaria, muestra un balloon tip nativo (`NotifyIcon`) — la técnica de
 * notificación toast (WinRT) se probó y no se mostraba sin un AppId registrado,
 * mientras que `NotifyIcon` funciona sin necesitar ese registro.
 */
function buildReminderScriptContent(statusFilePath: string): string {
    const escapedPath = statusFilePath.replace(/'/g, "''");
    return `try {
    $status = Get-Content -Raw -Path '${escapedPath}' | ConvertFrom-Json
    $today = Get-Date -Format 'yyyy-MM-dd'
    $todayMinutes = 0
    if ($status.date -eq $today) {
        $todayMinutes = $status.todayMinutes
    }
    $minimum = $status.minimumDailyMinutes

    if ($todayMinutes -lt $minimum) {
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing

        $notifyIcon = New-Object System.Windows.Forms.NotifyIcon
        $notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
        $notifyIcon.Visible = $true
        $notifyIcon.BalloonTipTitle = "Productivity Timer"
        $notifyIcon.BalloonTipText = "Todavia no completaste tu sesion minima de hoy ($todayMinutes/$minimum min)."
        $notifyIcon.ShowBalloonTip(15000)
        Start-Sleep -Seconds 16
        $notifyIcon.Dispose()
    }
} catch {
    # Sin archivo de estado (nunca se abrio VSCode) o datos invalidos: no se hace nada.
}
`;
}

export async function enableDailyReminder(context: vscode.ExtensionContext, dataManager: DataManager): Promise<void> {
    const config = vscode.workspace.getConfiguration('productivityTimer');

    const time = await vscode.window.showInputBox({
        prompt: 'Hora del recordatorio diario (formato 24h, HH:mm)',
        value: config.get<string>('dailyReminderTime', '20:00'),
        validateInput: (value) => {
            return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? null : 'Ingresa una hora válida en formato HH:mm (ej. 20:00)';
        }
    });

    if (!time) {
        return;
    }

    // Asegura que el sidecar file exista y esté fresco antes de generar el script.
    dataManager.refreshDailyStatusFile();

    const scriptPath = getReminderScriptPath(context);
    fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
    fs.writeFileSync(scriptPath, buildReminderScriptContent(dataManager.getDailyStatusFilePath()));

    const schtasksCommand =
        `schtasks /create /tn "${TASK_NAME}" /tr "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File \\"${scriptPath}\\"" /sc daily /st ${time} /f`;

    const confirmed = await vscode.window.showWarningMessage(
        `Esto va a registrar una tarea programada de Windows llamada "${TASK_NAME}" que se ejecuta todos los días a las ${time}, incluso con VSCode cerrado (solo si tenés sesión iniciada en Windows).\n\n` +
        `Script que se ejecutará:\n${scriptPath}\n\n` +
        `Comando exacto que se va a correr:\n${schtasksCommand}\n\n` +
        `Si desinstalás la extensión sin ejecutar antes "Desactivar Recordatorio Diario", la tarea queda registrada indefinidamente.`,
        { modal: true },
        'Sí, registrar la tarea'
    );

    if (confirmed !== 'Sí, registrar la tarea') {
        return;
    }

    try {
        await runSchtasks([
            '/create', '/tn', TASK_NAME,
            '/tr', `powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}"`,
            '/sc', 'daily',
            '/st', time,
            '/f'
        ]);
        await config.update('dailyReminderTime', time, vscode.ConfigurationTarget.Global);
        showToast(`✅ Recordatorio diario activado (${time})`, 8000);
    } catch (error) {
        vscode.window.showErrorMessage(`No se pudo registrar la tarea programada: ${error}`);
    }
}

/**
 * Consulta si la tarea programada ya está registrada, para poder mostrar el
 * estado real (no solo lo que dice la config) en el dashboard.
 */
export async function isDailyReminderEnabled(): Promise<boolean> {
    try {
        await runSchtasks(['/query', '/tn', TASK_NAME]);
        return true;
    } catch {
        return false;
    }
}

export async function disableDailyReminder(context: vscode.ExtensionContext): Promise<void> {
    try {
        await runSchtasks(['/delete', '/tn', TASK_NAME, '/f']);
        showToast('✅ Recordatorio diario desactivado');
    } catch (error) {
        // schtasks devuelve "no puede encontrar"/"cannot find" cuando la tarea
        // no existe (ej. ya se desactivó antes) — no es un error real en ese caso.
        const message = String(error).toLowerCase();
        if (message.includes('no puede encontrar') || message.includes('cannot find')) {
            showToast('El recordatorio diario no estaba activado');
        } else {
            vscode.window.showErrorMessage(`No se pudo eliminar la tarea programada: ${error}`);
            return;
        }
    }

    const scriptPath = getReminderScriptPath(context);
    if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
    }
}
