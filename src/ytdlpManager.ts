import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import { spawn } from 'child_process';
import { commandExists } from './utils';

/**
 * Release de yt-dlp fijada explícitamente (no "latest"): el hash SHA-256 de cada
 * asset solo es válido para este tag exacto. Al subir de versión hay que repetir
 * el proceso de obtener el `SHA2-256SUMS` oficial del nuevo release y actualizar
 * ambas constantes a la vez.
 */
const YTDLP_RELEASE_TAG = '2026.08.19';

interface YtDlpAsset {
    assetName: string;
    sha256: string;
}

/**
 * Mapa de plataforma/arquitectura -> asset oficial + su SHA-256, tomado del
 * archivo `SHA2-256SUMS` firmado publicado en la release de yt-dlp.
 * Ver https://github.com/yt-dlp/yt-dlp/releases/tag/2026.08.19
 */
const YTDLP_ASSETS: Record<string, YtDlpAsset> = {
    'win32-x64': { assetName: 'yt-dlp.exe', sha256: '66674953fe251b89f4d08c5f0e35e0728679bd67ab3d7d05c0562af101dd3e7a' },
    'win32-ia32': { assetName: 'yt-dlp_x86.exe', sha256: 'a8f91bd41452506bc81ebd2f369b186fea0ee7075413ba00cef9fd346a0a5d0c' },
    'win32-arm64': { assetName: 'yt-dlp_arm64.exe', sha256: '05b438997bafc3affdfda9d041353c9d73e04dc842207254b655b0887c4445b0' },
    'darwin-x64': { assetName: 'yt-dlp_macos', sha256: '0f192b7ec147ab6288885d6351d9ab67367640029b4377576ef46dd79cf7b202' },
    'darwin-arm64': { assetName: 'yt-dlp_macos', sha256: '0f192b7ec147ab6288885d6351d9ab67367640029b4377576ef46dd79cf7b202' },
    'linux-x64': { assetName: 'yt-dlp_linux', sha256: '58162f9bfdc27458ea47bfcb311cf47028f17d8154a8bf7d689861d46399230a' },
    'linux-arm64': { assetName: 'yt-dlp_linux_aarch64', sha256: 'b16e4dab368a816cd05d477d698a605a6ae87ccee1c8ffd38fa21d7254141fcc' },
};

function getAssetForCurrentPlatform(): YtDlpAsset | undefined {
    return YTDLP_ASSETS[`${process.platform}-${process.arch}`];
}

function getBinDir(context: vscode.ExtensionContext): string {
    return path.join(context.globalStorageUri.fsPath, 'bin');
}

function getYtDlpBinaryPath(context: vscode.ExtensionContext): string {
    return path.join(getBinDir(context), process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
}

function getVersionMarkerPath(binaryPath: string): string {
    return `${binaryPath}.version`;
}

function sha256File(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}

function downloadToFile(url: string, destPath: string, redirectsLeft = 5): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const request = https.get(url, { headers: { 'User-Agent': 'vscode-productivity-timer-extension' } }, (response) => {
            const { statusCode, headers } = response;

            if (statusCode && statusCode >= 300 && statusCode < 400 && headers.location) {
                file.close();
                fs.unlinkSync(destPath);
                if (redirectsLeft <= 0) {
                    reject(new Error('Demasiadas redirecciones al descargar yt-dlp'));
                    return;
                }
                downloadToFile(headers.location, destPath, redirectsLeft - 1).then(resolve, reject);
                return;
            }

            if (statusCode !== 200) {
                file.close();
                fs.unlink(destPath, () => { /* best effort */ });
                reject(new Error(`Descarga de yt-dlp falló con status ${statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => file.close(() => resolve()));
        });

        request.on('error', (error) => {
            file.close();
            fs.unlink(destPath, () => { /* best effort */ });
            reject(error);
        });
    });
}

/**
 * Se asegura de que exista un binario de yt-dlp verificado (checksum SHA-256
 * fijado en `YTDLP_ASSETS`) en `globalStorage`, pidiendo consentimiento
 * explícito antes de la primera descarga. Si el binario ya fue descargado y
 * verificado para el tag vigente, no vuelve a tocar la red ni a preguntar.
 *
 * Devuelve `undefined` si el usuario cancela el consentimiento, la plataforma
 * no tiene un asset fijado, o la verificación de checksum falla — en todos los
 * casos el caller debe hacer su propio fallback (nunca se ejecuta un binario
 * no verificado).
 */
export async function ensureYtDlp(context: vscode.ExtensionContext): Promise<string | undefined> {
    const asset = getAssetForCurrentPlatform();

    if (!asset) {
        // Plataforma/arquitectura sin asset oficial fijado (ej. Linux armv7l o musl).
        // Como último recurso, se acepta un yt-dlp ya instalado manualmente en el PATH.
        if (commandExists('yt-dlp')) {
            return 'yt-dlp';
        }
        vscode.window.showWarningMessage(
            `No hay un binario de yt-dlp verificado para tu plataforma (${process.platform}-${process.arch}). ` +
            'Instala yt-dlp manualmente y agrégalo al PATH: https://github.com/yt-dlp/yt-dlp#installation'
        );
        return undefined;
    }

    const binaryPath = getYtDlpBinaryPath(context);
    const versionMarkerPath = getVersionMarkerPath(binaryPath);

    if (fs.existsSync(binaryPath) && fs.existsSync(versionMarkerPath)) {
        const cachedTag = fs.readFileSync(versionMarkerPath, 'utf8').trim();
        if (cachedTag === YTDLP_RELEASE_TAG) {
            return binaryPath;
        }
    }

    const downloadUrl = `https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_RELEASE_TAG}/${asset.assetName}`;

    const confirmed = await vscode.window.showWarningMessage(
        'La alarma/video de YouTube necesita el binario de yt-dlp, que esta extensión no incluye por defecto.\n\n' +
        `Se descargará una única vez desde:\n${downloadUrl}\n\n` +
        `Se guardará en:\n${binaryPath}\n\n` +
        'Antes de usarlo, se verificará que su SHA-256 coincida exactamente con el publicado oficialmente ' +
        `por el proyecto yt-dlp para la release ${YTDLP_RELEASE_TAG}. Si no coincide, se descarta y no se ejecuta.`,
        { modal: true },
        'Sí, descargar yt-dlp'
    );

    if (confirmed !== 'Sí, descargar yt-dlp') {
        return undefined;
    }

    fs.mkdirSync(getBinDir(context), { recursive: true });
    const tmpPath = `${binaryPath}.download`;

    try {
        await downloadToFile(downloadUrl, tmpPath);

        const actualSha256 = await sha256File(tmpPath);
        if (actualSha256 !== asset.sha256) {
            fs.unlinkSync(tmpPath);
            vscode.window.showErrorMessage(
                'La descarga de yt-dlp no coincide con el checksum SHA-256 esperado. Se descartó el archivo por seguridad y no se ejecutó.'
            );
            return undefined;
        }

        fs.renameSync(tmpPath, binaryPath);
        if (process.platform !== 'win32') {
            fs.chmodSync(binaryPath, 0o755);
        }
        fs.writeFileSync(versionMarkerPath, YTDLP_RELEASE_TAG);

        return binaryPath;
    } catch (error) {
        if (fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath);
        }
        vscode.window.showErrorMessage(`No se pudo descargar yt-dlp: ${error}`);
        return undefined;
    }
}

/**
 * Usa yt-dlp para resolver la URL directa del stream (audio o audio+video,
 * según `formatArgs`) sin descargar el contenido — la URL resuelta se le pasa
 * al reproductor correspondiente (MediaPlayer .NET o ffplay).
 */
/**
 * Clientes de YouTube que yt-dlp prueba en orden hasta que uno resuelva el
 * stream sin pedir autenticación — mitigación (sin cookies) para el error
 * "Sign in to confirm you're not a bot" que YouTube dispara para el cliente
 * `web` por defecto en varios videos.
 */
const YOUTUBE_PLAYER_CLIENTS = 'tv,ios,android';

export function getStreamUrl(ytDlpPath: string, videoUrl: string, formatArgs: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const ytDlpProcess = spawn(ytDlpPath, [
            '-f', formatArgs,
            '-g',
            '--no-warnings',
            '--extractor-args', `youtube:player_client=${YOUTUBE_PLAYER_CLIENTS}`,
            videoUrl
        ]);

        let stdout = '';
        let stderr = '';

        ytDlpProcess.stdout?.on('data', (data) => { stdout += data.toString(); });
        ytDlpProcess.stderr?.on('data', (data) => { stderr += data.toString(); });

        ytDlpProcess.on('error', (error) => {
            reject(new Error(`No se pudo ejecutar yt-dlp: ${error.message}`));
        });

        ytDlpProcess.on('close', (code) => {
            const streamUrl = stdout.trim().split('\n')[0]?.trim();
            if (code !== 0 || !streamUrl) {
                const botCheckHint = stderr.includes('Sign in to confirm')
                    ? ' YouTube está pidiendo verificación anti-bot para este video en particular; probá con otro link — pasar cookies del navegador no está soportado todavía por esta extensión.'
                    : '';
                reject(new Error(
                    `yt-dlp no pudo resolver el stream (código ${code}).${botCheckHint} ` +
                    `Verifica que el link sea válido y esté disponible. ${stderr.trim()}`
                ));
                return;
            }
            resolve(streamUrl);
        });
    });
}
