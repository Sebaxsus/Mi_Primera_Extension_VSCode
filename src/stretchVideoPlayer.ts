import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { MusicPlayer } from './musicPlayer';
import { commandExists } from './utils';
import { ensureYtDlp, getStreamUrl } from './ytdlpManager';

const FFMPEG_DOWNLOAD_URL = 'https://ffmpeg.org/download.html';

export type StretchVideoAction =
    | 'togglePause'
    | 'back'
    | 'forward'
    | 'volDown'
    | 'volUp'
    | 'mute'
    | 'fullscreen'
    | 'stop';

export interface StretchVideoState {
    active: boolean;
    paused: boolean;
    muted: boolean;
    /** Solo en Windows se pueden enviar teclas a la ventana de ffplay; en otros SO solo se puede cerrar. */
    controllable: boolean;
}

/**
 * Virtual-key codes de las teclas que ffplay interpreta en su ventana
 * (ver "While playing" en la documentación de ffplay).
 */
const FFPLAY_KEYS: Record<Exclude<StretchVideoAction, 'stop'>, number> = {
    togglePause: 0x50, // p
    back: 0x25,        // ← (-10 s)
    forward: 0x27,     // → (+10 s)
    volDown: 0x39,     // 9
    volUp: 0x30,       // 0
    mute: 0x4D,        // m
    fullscreen: 0x46,  // f
};

/**
 * Reproduce el video de estiramiento en una ventana nativa de `ffplay` y permite
 * controlarlo (solo ese video) enviando teclas a la ventana de ese PID a través
 * del bridge de PowerShell. ffplay no tiene IPC ni lee comandos por stdin.
 *
 * Emite `'change'` con un `StretchVideoState` cada vez que cambia el estado.
 */
export class StretchVideoPlayer extends EventEmitter implements vscode.Disposable {
    private process: ChildProcess | null = null;
    private paused = false;
    private muted = false;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly musicPlayer: MusicPlayer
    ) {
        super();
    }

    getState(): StretchVideoState {
        return {
            active: this.process !== null,
            paused: this.paused,
            muted: this.muted,
            controllable: process.platform === 'win32',
        };
    }

    /**
     * Reproduce el video vía `ffplay` si ffmpeg está instalado; si no, avisa cómo
     * instalarlo y abre el video en el navegador para no dejar al usuario sin nada.
     */
    async play(video: string): Promise<void> {
        if (!commandExists('ffplay')) {
            vscode.window.showWarningMessage(
                `ffmpeg (que incluye ffplay) es necesario para reproducir el video de estiramiento dentro de la extensión. ` +
                `Instálalo y agrégalo al PATH de tu sistema operativo: ${FFMPEG_DOWNLOAD_URL}`
            );
            vscode.env.openExternal(vscode.Uri.parse(video));
            return;
        }

        const ytDlpPath = await ensureYtDlp(this.context);
        if (!ytDlpPath) {
            vscode.env.openExternal(vscode.Uri.parse(video));
            return;
        }

        try {
            const streamUrl = await getStreamUrl(ytDlpPath, video, 'best[ext=mp4]/best');

            // Un solo video a la vez.
            this.stop();

            // stdio 'ignore' + '-nostats': ffplay escribe su línea de estado en stderr
            // varias veces por segundo; si nadie lee el pipe, el buffer se llena y ffplay
            // se bloquea (el video se congelaba a los 10-30 s).
            // detached (y no windowsHide): windowsHide también oculta la ventana SDL del
            // video; detached evita que se cree una consola sin ocultar esa ventana.
            const ffplayProcess = spawn(
                'ffplay',
                ['-autoexit', '-loglevel', 'error', '-nostats', '-window_title', 'Estiramiento', streamUrl],
                { stdio: 'ignore', detached: true }
            );

            this.process = ffplayProcess;
            this.paused = false;
            this.muted = false;
            this.emitChange();

            ffplayProcess.on('error', () => {
                vscode.window.showErrorMessage('Error al reproducir el video de estiramiento con ffplay');
                vscode.env.openExternal(vscode.Uri.parse(video));
            });

            ffplayProcess.on('exit', () => {
                // Solo se limpia si sigue siendo el proceso actual (no uno ya reemplazado).
                if (this.process === ffplayProcess) {
                    this.process = null;
                    this.emitChange();
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error al reproducir el video de estiramiento: ${error}`);
            vscode.env.openExternal(vscode.Uri.parse(video));
        }
    }

    control(action: StretchVideoAction): void {
        if (!this.process?.pid) {
            return;
        }

        if (action === 'stop') {
            this.stop();
            return;
        }

        if (process.platform !== 'win32') {
            return;
        }

        this.musicPlayer.windowKey(this.process.pid, FFPLAY_KEYS[action]);

        if (action === 'togglePause') {
            this.paused = !this.paused;
            this.emitChange();
        } else if (action === 'mute') {
            this.muted = !this.muted;
            this.emitChange();
        }
    }

    stop(): void {
        if (this.process) {
            const current = this.process;
            this.process = null;
            current.kill();
            this.emitChange();
        }
    }

    dispose(): void {
        this.stop();
        this.removeAllListeners();
    }

    private emitChange(): void {
        this.emit('change', this.getState());
    }
}
