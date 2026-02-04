import { spawn, ChildProcess } from 'child_process';

export class MusicPlayer {
    private psProcess: ChildProcess | null = null;

    constructor() {
        this.initPlayer();
    }

    private initPlayer() {
        // Iniciamos PowerShell en modo persistente
        this.psProcess = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', 'C:/Users/sebax/Desktop/Universidad/Proyectos_aleatorios/Mi_Primer_VSCodeExtension/vscode-productivity-timer/src/player_bridge.ps1']);
        
        this.psProcess.stderr?.on('data', (data) => console.error(`PS Error: ${data}`));
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