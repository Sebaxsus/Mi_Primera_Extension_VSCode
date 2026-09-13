import * as vscode from 'vscode';
import { AlarmManager } from './alarmManager';
import { DataManager } from './dataManager';
import { DEFAULT_STRETCH_VIDEOS } from './stretchVideos';
import { showToast } from './notify';
import { refreshStatsPanelIfOpen } from './WebView/panelManager';

export enum TimerState {
    IDLE,
    WORKING,
    BREAK,
    STRETCHING,
    DAILY_LIMIT
}

export class Timer {
    private state: TimerState = TimerState.IDLE;
    private remainingSeconds: number = 0;
    private interval: NodeJS.Timeout | null = null;
    private statusBarItem: vscode.StatusBarItem;
    private alarmManager: AlarmManager;
    private dataManager: DataManager;
    private dailyLimitSeconds: number = 0;
    private sessionStartTime: number = 0;
    private isFinishing: boolean = false;

    //
    private answer: string | undefined;

    constructor(
        statusBarItem: vscode.StatusBarItem,
        alarmManager: AlarmManager,
        dataManager: DataManager
    ) {
        this.statusBarItem = statusBarItem;
        this.alarmManager = alarmManager;
        this.dataManager = dataManager;
        this.updateStatusBar();
    }

    /**
     * Inicia una sesion de trabajo.
     * 
     * Que consiste asignar el tiempo de trabajo al atributo `remainingSeconds`
     * usando los valores configurados por el usuario o el valor por defecto "30".
     * 
     * Cambiar el estado `TimerState` a "WORKING".
     * 
     * Almacenar en Memoria (Variable) el tiempo de inicio.
     * 
     * Llamar el metodo `startTimer()`.
     * 
     * @returns 
     */
    startWork(): void {
        if (this.state !== TimerState.IDLE) {
            vscode.window.showWarningMessage('Ya hay un temporizador en ejecución');
            return;
        }

        const config = vscode.workspace.getConfiguration('productivityTimer');
        const workMinutes = config.get<number>('workDuration', 30);

        this.remainingSeconds = workMinutes * 60;
        this.state = TimerState.WORKING;
        this.sessionStartTime = Date.now();
        this.startTimer();

        showToast(`🍅 Sesión de trabajo iniciada: ${workMinutes} minutos`);
    }

    /**
     *  Se encarga de iniciar un descanso.
     * 
     *  Verifica que no se este ejecutando ningun temporizador.
     * 
     *  Carga la configuracion, Extrae el tiempo de descanso y lo asigna a `remainingSeconds`.
     * 
     *  Cambia el estado de `TimerState` a "BREAK".
     * 
     * @returns 
     */
    startBreak(): void {
        if (this.state !== TimerState.IDLE) {
            vscode.window.showWarningMessage('Hay un temporizador de sesion en ejecución');
            return;
        }

        const config = vscode.workspace.getConfiguration('productivityTimer');
        const breakMinutes = config.get<number>('breakDuration', 10);

        this.remainingSeconds = breakMinutes * 60;
        this.state = TimerState.BREAK;
        this.sessionStartTime = Date.now();
        this.startTimer();

        showToast(`☕ Descanso iniciado: ${breakMinutes} minutos`);
    }

    /**
     * Inicia la etapa de estiramiento. Sigue el mismo patrón que `startBreak()`.
     */
    startStretch(): void {
        if (this.state !== TimerState.IDLE) {
            vscode.window.showWarningMessage('Ya hay un temporizador en ejecución');
            return;
        }

        const config = vscode.workspace.getConfiguration('productivityTimer');
        const stretchMinutes = config.get<number>('stretchDuration', 5);

        this.remainingSeconds = stretchMinutes * 60;
        this.state = TimerState.STRETCHING;
        this.sessionStartTime = Date.now();
        this.startTimer();

        showToast(`🧘 Estiramiento iniciado: ${stretchMinutes} minutos`);

        this.offerStretchVideo();
    }

    /**
     * Elige un video de estiramiento (config del usuario o lista por defecto)
     * y pregunta si abrirlo en el navegador.
     */
    private async offerStretchVideo(): Promise<void> {
        const video = this.pickStretchVideo();
        if (!video) {
            return;
        }

        const answer = await vscode.window.showInformationMessage(
            '¿Quieres abrir un video con una rutina de estiramiento?',
            'Sí',
            'No'
        );

        if (answer === 'Sí') {
            vscode.env.openExternal(vscode.Uri.parse(video));
        }
    }

    private pickStretchVideo(): string | undefined {
        const config = vscode.workspace.getConfiguration('productivityTimer');
        const customVideos = config.get<string[]>('stretchVideos', []);
        const videos = customVideos.length > 0 ? customVideos : DEFAULT_STRETCH_VIDEOS;

        if (videos.length === 0) {
            return undefined;
        }

        return videos[Math.floor(Math.random() * videos.length)];
    }

    async setDailyLimit(): Promise<void> {
        const input = await vscode.window.showInputBox({
            prompt: 'Ingresa el límite de tiempo de programación hoy (en minutos)',
            placeHolder: '30',
            validateInput: (value) => {
                const num = parseInt(value);
                if (isNaN(num) || num <= 0) {
                    return 'Por favor ingresa un número válido mayor a 0';
                }
                return null;
            }
        });

        if (input) {
            const minutes = parseInt(input);
            const todayMinutes = this.dataManager.getTodayMinutes();
            const remainingMinutes = Math.max(0, minutes - todayMinutes);

            if (remainingMinutes === 0) {
                showToast(`✅ ¡Ya alcanzaste tu objetivo de ${minutes} minutos hoy!`);
                return;
            }

            this.dailyLimitSeconds = remainingMinutes * 60;
            this.remainingSeconds = this.dailyLimitSeconds;
            this.state = TimerState.DAILY_LIMIT;
            this.sessionStartTime = Date.now();
            this.startTimer();

            showToast(`⏰ Límite diario establecido: ${remainingMinutes} minutos restantes`);
        }
    }

    private startTimer(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            this.remainingSeconds--;

            if (this.remainingSeconds <= 0) {
                clearInterval(this.interval!);
                this.interval = null;
                this.onTimerComplete();
                return;
            }

            this.updateStatusBar();
        }, 1000);

        this.updateStatusBar();
    }

    private async onTimerComplete(): Promise<void> {
        if (this.isFinishing) {
            return;
        }
        this.isFinishing = true;

        try {
            // Se captura el estado antes de llamar stopTimer(), que ahora
            // siempre resetea this.state a IDLE.
            const finishedState = this.state;
            await this.onTimerCompleteFor(finishedState);
        } finally {
            this.isFinishing = false;
        }
    }

    private async onTimerCompleteFor(finishedState: TimerState): Promise<void> {
        this.stopTimer();

        const elapsedMinutes = Math.floor((Date.now() - this.sessionStartTime) / 60000);

        console.log('Contador Finalizado, Estado: %s', finishedState);

        switch (finishedState) {
            case TimerState.WORKING:
                console.log("Ejecutando Alarma.");
                // Esto bloque la ejecucion.
                await this.alarmManager.playAlarm();
                // await this.dataManager.addSession(elapsedMinutes);
                
                const stats = this.dataManager.getStats();
                showToast(
                    `✅ ¡Sesión completada! +${elapsedMinutes} minutos | ` +
                    `Puntos: ${stats.points} 🏆 | Racha: ${stats.currentStreak} días 🔥`,
                    8000
                );

                // Preguntar si quiere descansar --- Si Bloquea la Exec
                this.answer = await vscode.window.showInformationMessage(
                    '¿Quieres iniciar un descanso?',
                    'Sí',
                    'No'
                );

                if (this.answer === 'Sí') {
                    this.startBreak();
                }
                
                // Deteniendo la alarma, Despues de confirmar user Input :).
                this.alarmManager.stopAlarm();

                break;

            case TimerState.BREAK:
                await this.alarmManager.playAlarm();
                showToast('⏰ Descanso terminado. ¡Es hora de volver al trabajo!');

                this.answer = await vscode.window.showInformationMessage(
                    '¿Quieres hacer una pausa de estiramiento?',
                    'Sí',
                    'No'
                );

                if (this.answer === 'Sí') {
                    this.startStretch();
                } else {
                    this.answer = await vscode.window.showInformationMessage(
                        '¿Quieres iniciar otra sesion?',
                        'Sí',
                        'No'
                    );

                    if (this.answer === 'Sí') {
                        this.startWork();
                    }
                }

                this.alarmManager.stopAlarm();

                break;

            case TimerState.STRETCHING:
                await this.alarmManager.playAlarm();
                showToast('🧘 Estiramiento terminado. ¡Buen trabajo cuidando tu cuerpo!');

                this.answer = await vscode.window.showInformationMessage(
                    '¿Quieres iniciar otra sesion de trabajo?',
                    'Sí',
                    'No'
                );

                if (this.answer === 'Sí') {
                    this.startWork();
                }

                this.alarmManager.stopAlarm();

                break;

            case TimerState.DAILY_LIMIT:
                await this.alarmManager.playAlarm();
                await this.dataManager.addSession(elapsedMinutes);
                refreshStatsPanelIfOpen();

                showToast(`🎯 ¡Objetivo diario alcanzado! Trabajaste ${elapsedMinutes} minutos`, 8000);

                break;
            default:
                console.error("Entro a default (Error), Estado: %s", finishedState);
        }

        this.updateStatusBar();
    }

    stopTimer(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (this.state === TimerState.WORKING || this.state === TimerState.DAILY_LIMIT) {
            // Guardar el tiempo trabajado aunque no se complete la sesión
            const elapsedMinutes = Math.floor((Date.now() - this.sessionStartTime) / 60000);
            if (elapsedMinutes > 0) {
                this.dataManager.addSession(elapsedMinutes);
                refreshStatsPanelIfOpen();
            }
        }

        this.alarmManager.stopAlarm();
        this.state = TimerState.IDLE;
        this.remainingSeconds = 0;
        this.updateStatusBar();

        if (!this.isFinishing) {
            showToast('⏹️ Temporizador detenido');
        }
    }

    private updateStatusBar(): void {
        if (this.state === TimerState.IDLE) {
            const stats = this.dataManager.getStats();
            this.statusBarItem.text = `$(clock) Pomodoro | 🔥${stats.currentStreak} | ⭐${stats.points}`;
            this.statusBarItem.tooltip = 
                `Racha: ${stats.currentStreak} días\n` +
                `Puntos: ${stats.points}\n` +
                `Total: ${stats.totalMinutes} minutos\n` +
                `Click para iniciar sesión`;
            this.statusBarItem.command = 'productivityTimer.startWorkSession';
        } else {
            const minutes = Math.floor(this.remainingSeconds / 60);
            const seconds = this.remainingSeconds % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            let icon = '';
            let label = '';
            switch (this.state) {
                case TimerState.WORKING:
                    icon = '🍅';
                    label = 'Trabajando';
                    break;
                case TimerState.BREAK:
                    icon = '☕';
                    label = 'Descansando';
                    break;
                case TimerState.STRETCHING:
                    icon = '🧘';
                    label = 'Estirando';
                    break;
                case TimerState.DAILY_LIMIT:
                    icon = '⏰';
                    label = 'Objetivo diario';
                    break;
            }

            this.statusBarItem.text = `${icon} ${timeString} - ${label}`;
            this.statusBarItem.tooltip = `${label}: ${timeString} restantes\nClick para detener`;
            this.statusBarItem.command = 'productivityTimer.stopTimer';
        }

        this.statusBarItem.show();
    }

    getState(): TimerState {
        return this.state;
    }

    dispose(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.statusBarItem.dispose();
    }
}
