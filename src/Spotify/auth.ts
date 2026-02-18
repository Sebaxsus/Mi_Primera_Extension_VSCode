import { exec } from "node:child_process";
import { activateCallBackListener } from "./callBackServer";

export interface SpotifyToken {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
}

export class SpotifyAuth {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string = "https://127.0.0.1:8888/callback";

    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    async auth(scopes: string[] = ["user-read-playback-state","user-modify-playback-state","user-read-currently-playing","app-remote-control","streaming"]): Promise<SpotifyToken> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            redirect_uri: this.redirectUri,
            scope: scopes.join(' '),
            // Show_dialog fuerza a que el usuario vea la pantalla de login siempre
            show_dialog: 'true' 
        });

        // Abriendo el navegador (Comando para Windows/CMD)
        exec(`start "" "${`https://accounts.spotify.com/authorize?${params.toString()}`}"`);

        
        // El código se detiene aquí hasta que el servidor reciba el código
        const code = await activateCallBackListener("http://127.0.0.1", 5000);
        console.log("Código recibido:", code);

        // Obtener el token
        const token = await this.getToken(code);
        console.log("Tokens obtenidos con éxito:", token.access_token);
        
        return token;
    }

    async getToken(code: string): Promise<SpotifyToken> {
        const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: this.redirectUri,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error canjeando código: ${error}`);
        }

        return await response.json() as SpotifyToken;
    }

    async refreshAccessToken(refreshToken: string): Promise < Partial < SpotifyToken >> {
        const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        return await response.json() as SpotifyToken;
    }
}