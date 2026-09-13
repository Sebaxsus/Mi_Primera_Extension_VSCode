import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

/**
 * ### TODO
 * - [ ] Consulta de estado: Puedes añadir un setInterval en Node que envíe el comando status cada segundo para actualizar una barra de progreso en tu interfaz de usuario.
 * - [ ] Manejo de errores: Si el archivo no existe o el formato no es compatible, PowerShell enviará un JSON con el error y Node podrá mostrar una alerta o hacer un fallback al systemBeep.
 */
export class MusicPlayer {
    private psProcess: ChildProcess | null = null;
    private lastStatus: any = null;

    constructor() {
        this.initPlayer();
    }

    private initPlayer() {
        // Iniciamos PowerShell en modo persistente.
        // player_bridge.ps1 se copia junto al JS compilado (ver script "postcompile"),
        // por lo que siempre vive al lado de este archivo, tanto en desarrollo como empaquetado.
        const bridgePath = path.join(__dirname, 'player_bridge.ps1');
        this.psProcess = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', bridgePath]);

        // Escuchar mensajes provenientes de PowerShell
        this.psProcess.stdout?.on('data', (data) => {
            const output = data.toString().trim();
            try {
                const response = JSON.parse(output);
                this.handlePowerShellEvent(response);
            } catch (e) {
                // Ignorar basura que no sea JSON
            }
        });

        this.psProcess.stderr?.on('data', (data) => console.error(`PS Error: ${data}`));
    }

    private handlePowerShellEvent(response: any) {
        switch (response.event) {
            case "info":
                console.log(`[${response.type}] [${response.timestamp}] ${response.msg}`);
                break;
            case "status_update":
                this.lastStatus = response;
                console.log(`[Audio] Posición: ${response.position}s | Volumen: ${response.volume * 100}% | Buffering: ${response.buffering} | Estado: ${response.playerStatus}`);
                break;
            case "currentSong":
                console.log(`Cancion Actual: ${response.currentSong}`);
                break;
            case "error":
                console.error(`[Audio Error] ${response.message}`);
                break;
            default:
                console.log("Respuesta pwsh process\nObjecto %o", response);
                break;
        }
    }

    private sendCommand(command: string, extra = {}) {
        const message = JSON.stringify({ command, ...extra });
        this.psProcess?.stdin?.write(`${message}\n`);
    }

    /**
     * Establece una fuente al reproductor y luego la ejecuta.
     * @param filePath - Ruta al archivo ya sea local o una url a un stream.
     */
    public play(filePath: string) {
        this.sendCommand('open', { path: filePath });
        this.sendCommand('play');
    }

    /**
     * 
     * @param volume - Valor entre el rango 0 - 100
     */
    public setVolume(volume: number) {
        // Deberia validar el volumen por segunda vez???
        // if (volume > 100) {
        //     volume = 100;
        // }
        // if (volume < 0) {
        //     volume = 0;
        // }
        // volumen de 0 a 100 -> 0.0 a 1.0
        this.sendCommand('volume', { value: volume / 100 });
    }

    /**
     * Pausa la ejecucion del reproductor sin cerrar la fuente actual.
     */
    public pause() {
        this.sendCommand('pause');
    }

    /**
     * Detiene la ejecucion del reproductor.
     */
    public stop() {
        this.sendCommand('stop');
    }

    /**
     * Solicuta un reporte de estado al reproductor.
     */
    public status() {
        this.sendCommand('status');
    }

    /**
     * Solicita al bridge la fuente actualmente cargada en el reproductor.
     */
    public currentSong() {
        this.sendCommand('currentSong');
    }

    /**
     * Indica si el ultimo `status_update` recibido reporta reproduccion activa.
     */
    public isPlaying(): boolean {
        return this.lastStatus?.playerStatus === 'Playing';
    }

    execCommand(command: string) {
        this.sendCommand('command', { msg: command });
    }
}