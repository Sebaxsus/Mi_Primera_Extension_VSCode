import { spawn, ChildProcess } from 'child_process';

/**
 * ### TODO
 * - [ ] Consulta de estado: Puedes añadir un setInterval en Node que envíe el comando status cada segundo para actualizar una barra de progreso en tu interfaz de usuario.
 * - [ ] Manejo de errores: Si el archivo no existe o el formato no es compatible, PowerShell enviará un JSON con el error y Node podrá mostrar una alerta o hacer un fallback al systemBeep.
 */
export class MusicPlayer {
    private psProcess: ChildProcess | null = null;

    constructor() {
        this.initPlayer();
    }

    private initPlayer() {
        // Iniciamos PowerShell en modo persistente
        this.psProcess = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', 'C:/Users/sebax/Desktop/Universidad/Proyectos_aleatorios/Mi_Primer_VSCodeExtension/vscode-productivity-timer/src/player_bridge.ps1']);
        
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
            case "status_update":
                console.log(`[Audio] Posición: ${response.position}s | Volumen: ${response.volume * 100}%`);
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

    public play(filePath: string) {
        this.sendCommand('open', { path: filePath });
        this.sendCommand('play');
    }

    public setVolume(volume: number) {
        // volumen de 0 a 100 -> 0.0 a 1.0
        this.sendCommand('volume', { value: volume / 100 });
    }

    public stop() {
        this.sendCommand('stop');
    }
}