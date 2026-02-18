import http from 'http';
import { URL } from 'node:url';

export async function activateCallBackListener(domain: string = "http://127.0.0.1",port: number = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            // Parsear la URL para obtener el parámetro ?code=
            const requestUrl = new URL(req.url || '', `${domain}:${port}`);
            const code = requestUrl.searchParams.get('code');

            if (code) {
                // Responder al navegador para que el usuario sepa que terminó
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1>Autorizado correctamente</h1><p>Ya puedes cerrar esta ventana.</p>');
                
                // Cerramos el servidor y devolvemos el código
                server.close();
                resolve(code);
            } else {
                res.writeHead(400);
                res.end('No se encontro el codigo de autorizacion.');
            }
        });

        server.listen(port, () => {
            console.log(`Esperando callback de Spotify en ${domain}:${port}...`);
        });

        server.on('error', (err) => reject(err));
    });
}