import { exec } from 'child_process';
import { promisify } from 'util';

interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
}


const execAsync = promisify(exec);

const subirVolumen = `powershell.exe -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]175)"`;
const bajarVolumen = `powershell.exe -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]174)"`;

// Play / Pausa
const play_pause = `powershell.exe -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]179)"`;

// Siguiente canción
const next = `powershell.exe -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]176)"`;

// Canción anterior
const previus = `powershell.exe -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]177)"`;

export class SpotifyLocalController {
    private clientId: string;
    private clientSecret: string;
    private token: string | null = null;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Obtiene token básico (Funciona para usuarios Free)
     */
    private async getAccessToken() {
        if (this.token) return this.token;
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ grant_type: 'client_credentials' })
        });
        const data = await res.json() as any;
        this.token = data.access_token;
        return this.token;
    }

    /**
     * Busca y reproduce
     */
    async searchAndPlay(query: string) {
        const token = await this.getAccessToken();
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;
        
        const res = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json() as any;
        const track = data.tracks.items[0];

        if (track) {
            console.log(`Reproduciendo: ${track.name} - ${track.artists[0].name}`);
            // Ejecutamos el URI nativo vía PowerShell
            exec(`powershell.exe -Command "Start-Process 'spotify:track:${track.id}'"`);
        } else {
            console.log("No se encontró la canción.");
        }
    }

    /**
     * Lee el título de la ventana de Spotify (Lo que suena ahora)
     */
    async getCurrentlyPlayingLocal(): Promise<string> {
        try {
            // Este comando busca el proceso Spotify y extrae el título de su ventana principal
            const command = `powershell.exe -Command "(Get-Process Spotify | Where-Object {$_.MainWindowTitle} | Select-Object -First 1).MainWindowTitle"`;
            const { stdout } = await execAsync(command);
            const title = stdout.trim();
            
            return title === "Spotify" ? "Pausado o sin canción" : title;
        } catch (e) {
            return "Spotify no está abierto";
        }
    }
}