import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class AlarmManager {
    private currentProcess: child_process.ChildProcess | null = null;

    async playAlarm(): Promise<void> {
        const config = vscode.workspace.getConfiguration('productivityTimer');
        const alarmType = config.get<string>('alarmType', 'local');
        const alarmPath = config.get<string>('alarmPath', '');
        const volume = config.get<number>('volume', 50);

        try {
            switch (alarmType) {
                case 'youtube':
                    await this.playYouTube(alarmPath, volume);
                    break;
                case 'spotify':
                    await this.playSpotify(alarmPath);
                    break;
                case 'local':
                default:
                    await this.playLocal(alarmPath, volume);
                    break;
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error al reproducir alarma: ${error}`);
            // Reproducir sonido del sistema como respaldo
            this.playSystemBeep();
        }
    }

    private async playLocal(filePath: string, volume: number): Promise<void> {
        if (!filePath || !fs.existsSync(filePath)) {
            this.playSystemBeep();
            return;
        }

        const platform = process.platform;

        try {
            if (platform === 'win32') {
                // Windows: usar PowerShell
                const volumeDecimal = volume / 100;
                const command = `powershell -c "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`;
                child_process.exec(command);
            } else if (platform === 'darwin') {
                // macOS: usar afplay
                const volumeDecimal = volume / 100;
                child_process.spawn('afplay', ['-v', volumeDecimal.toString(), filePath]);
            } else {
                // Linux: intentar varios reproductores
                if (this.commandExists('ffplay')) {
                    const volumeDb = this.volumeToDb(volume);
                    this.currentProcess = child_process.spawn('ffplay', [
                        '-nodisp',
                        '-autoexit',
                        '-volume',
                        volumeDb.toString(),
                        filePath
                    ]);
                } else if (this.commandExists('mpg123')) {
                    child_process.spawn('mpg123', [filePath]);
                } else if (this.commandExists('aplay')) {
                    child_process.spawn('aplay', [filePath]);
                } else {
                    this.playSystemBeep();
                }
            }
        } catch (error) {
            this.playSystemBeep();
        }
    }

    private async playYouTube(url: string, volume: number): Promise<void> {
        if (!url) {
            this.playSystemBeep();
            return;
        }

        // Verificar si yt-dlp y ffmpeg están disponibles
        const hasYtDlp = this.commandExists('yt-dlp');
        const hasFfmpeg = this.commandExists('ffmpeg');

        if (!hasYtDlp || !hasFfmpeg) {
            vscode.window.showWarningMessage(
                'yt-dlp y ffmpeg son necesarios para reproducir desde YouTube. ' +
                'Por favor instálalos o usa un archivo local.'
            );
            this.playSystemBeep();
            return;
        }

        try {
            const volumeDb = this.volumeToDb(volume);
            
            // Usar yt-dlp para obtener el stream y ffplay para reproducir
            const ytDlpProcess = child_process.spawn('yt-dlp', [
                '-f', 'bestaudio',
                '-o', '-',
                url
            ]);

            this.currentProcess = child_process.spawn('ffplay', [
                '-nodisp',
                '-autoexit',
                '-volume', volumeDb.toString(),
                '-'
            ]);

            // Conectar la salida de yt-dlp con la entrada de ffplay
            ytDlpProcess.stdout.pipe(this.currentProcess.stdin);

            ytDlpProcess.on('error', () => {
                vscode.window.showErrorMessage('Error al descargar audio de YouTube');
                this.playSystemBeep();
            });

        } catch (error) {
            this.playSystemBeep();
        }
    }

    private async playSpotify(trackUri: string): Promise<void> {
        // Para Spotify, necesitamos usar la API de Spotify o controles del sistema
        const platform = process.platform;

        try {
            if (platform === 'win32') {
                // Windows: intentar controlar Spotify via comando
                vscode.window.showInformationMessage(
                    'Por favor, reproduce manualmente la canción en Spotify. ' +
                    'El control automático de Spotify requiere configuración adicional.'
                );
            } else if (platform === 'darwin') {
                // macOS: usar AppleScript
                if (trackUri) {
                    const script = `tell application "Spotify" to play track "${trackUri}"`;
                    child_process.exec(`osascript -e '${script}'`);
                } else {
                    child_process.exec('osascript -e \'tell application "Spotify" to play\'');
                }
            } else {
                // Linux: usar dbus si está disponible
                if (this.commandExists('dbus-send')) {
                    child_process.exec('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Play');
                } else {
                    vscode.window.showInformationMessage('Por favor, reproduce manualmente la canción en Spotify.');
                }
            }
        } catch (error) {
            this.playSystemBeep();
        }
    }

    private playSystemBeep(): void {
        // Usar el beep del sistema como último recurso
        const platform = process.platform;
        
        if (platform === 'win32') {
            child_process.exec('rundll32 user32.dll,MessageBeep');
        } else if (platform === 'darwin') {
            child_process.exec('afplay /System/Library/Sounds/Glass.aiff');
        } else {
            // Linux
            if (this.commandExists('paplay')) {
                child_process.exec('paplay /usr/share/sounds/freedesktop/stereo/complete.oga');
            } else if (this.commandExists('speaker-test')) {
                child_process.exec('speaker-test -t sine -f 1000 -l 1');
            }
        }
    }

    private commandExists(command: string): boolean {
        try {
            const platform = process.platform;
            const checkCommand = platform === 'win32' ? 'where' : 'which';
            child_process.execSync(`${checkCommand} ${command}`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    private volumeToDb(volume: number): number {
        // Convertir volumen de 0-100 a escala de dB para ffplay
        // ffplay usa 0-100 donde 100 es el volumen original
        return volume;
    }

    stopAlarm(): void {
        if (this.currentProcess) {
            this.currentProcess.kill();
            this.currentProcess = null;
        }
    }

    async testAlarm(): Promise<void> {
        vscode.window.showInformationMessage('🔊 Probando alarma...');
        await this.playAlarm();
        
        // Detener después de 3 segundos
        setTimeout(() => {
            this.stopAlarm();
        }, 3000);
    }
}
