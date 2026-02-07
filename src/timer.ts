import * as vscode from 'vscode';
import { AlarmManager } from './alarmManager';
import { DataManager } from './dataManager';

export enum TimerState {
    IDLE,
    WORKING,
    BREAK,
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

        vscode.window.showInformationMessage(
            `🍅 Sesión de trabajo iniciada: ${workMinutes} minutos`
        );
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

        vscode.window.showInformationMessage(
            `☕ Descanso iniciado: ${breakMinutes} minutos`
        );
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
                vscode.window.showInformationMessage(
                    `✅ ¡Ya alcanzaste tu objetivo de ${minutes} minutos hoy!`
                );
                return;
            }

            this.dailyLimitSeconds = remainingMinutes * 60;
            this.remainingSeconds = this.dailyLimitSeconds;
            this.state = TimerState.DAILY_LIMIT;
            this.sessionStartTime = Date.now();
            this.startTimer();

            vscode.window.showInformationMessage(
                `⏰ Límite diario establecido: ${remainingMinutes} minutos restantes`
            );
        }
    }

    private startTimer(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            this.remainingSeconds--;

            if (this.remainingSeconds <= 0) {
                this.onTimerComplete();
            }

            this.updateStatusBar();
        }, 1000);

        this.updateStatusBar();
    }

    private async onTimerComplete(): Promise<void> {
        this.stopTimer();

        const elapsedMinutes = Math.floor((Date.now() - this.sessionStartTime) / 60000);

        console.log('Contador Finalizado, Estado: %s', this.state);

        switch (this.state) {
            case TimerState.WORKING:
                // Cambiando el estado a IDLE, Con el fin de poder entrar en un descanso (Break)
                this.state = TimerState.IDLE;

                console.log("Ejecutando Alarma.");
                // Esto bloque la ejecucion.
                await this.alarmManager.playAlarm();
                // await this.dataManager.addSession(elapsedMinutes);
                
                const stats = this.dataManager.getStats();
                vscode.window.showInformationMessage(
                    `✅ ¡Sesión completada! +${elapsedMinutes} minutos | ` +
                    `Puntos: ${stats.points} 🏆 | Racha: ${stats.currentStreak} días 🔥`
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
                vscode.window.showInformationMessage(
                    '⏰ Descanso terminado. ¡Es hora de volver al trabajo!'
                );

                this.state = TimerState.IDLE;

                this.answer = await vscode.window.showInformationMessage(
                    '¿Quieres iniciar otra sesion?',
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
                
                vscode.window.showInformationMessage(
                    `🎯 ¡Objetivo diario alcanzado! Trabajaste ${elapsedMinutes} minutos`
                );

                this.state = TimerState.IDLE;
                break;
            default:
                console.error("Entro a default (Error), Estado: %s", this.state);
        }

        // Como esta fuera del Switch se ejecuta al final y rompe la ejecucion.
        // this.state = TimerState.IDLE;
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
            }
        }

        this.alarmManager.stopAlarm();
        // this.state = TimerState.IDLE; // Esta linea Rompe el flujo de onTimerComplete Si se ejecuta stopTimer primero.
        this.remainingSeconds = 0;
        this.updateStatusBar();

        vscode.window.showInformationMessage('⏹️ Temporizador detenido');
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
