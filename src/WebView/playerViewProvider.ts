import * as vscode from 'vscode';
import { MusicPlayer } from '../musicPlayer';
import { getPlayerHtml } from './playerView';

const POLLING_INTERVAL_MS = 2000;

/**
 * Vista persistente (activity bar) con controles de reproducción tipo
 * "flyout" de Windows. Reutiliza la misma instancia de `MusicPlayer` (y su
 * proceso de PowerShell persistente) que usa `AlarmManager` para la alarma.
 */
export class PlayerViewProvider implements vscode.WebviewViewProvider {
    private view: vscode.WebviewView | undefined;
    private pollingInterval: NodeJS.Timeout | undefined;

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly musicPlayer: MusicPlayer
    ) {
        this.musicPlayer.on('event', (response: any) => {
            if (response.event === 'mediaInfo') {
                this.view?.webview.postMessage({
                    command: 'mediaInfo',
                    title: response.title,
                    artist: response.artist,
                    status: response.status
                });
            }
        });
    }

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')]
        };

        webviewView.webview.html = getPlayerHtml(webviewView.webview, this.extensionUri);

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'mediaPlayPause':
                    this.musicPlayer.mediaPlayPause();
                    break;
                case 'mediaNext':
                    this.musicPlayer.mediaNext();
                    break;
                case 'mediaPrevious':
                    this.musicPlayer.mediaPrevious();
                    break;
                case 'mediaVolumeUp':
                    this.musicPlayer.mediaVolumeUp();
                    break;
                case 'mediaVolumeDown':
                    this.musicPlayer.mediaVolumeDown();
                    break;
            }
        });

        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this.startPolling();
            } else {
                this.stopPolling();
            }
        });

        webviewView.onDidDispose(() => {
            this.stopPolling();
            this.view = undefined;
        });

        this.startPolling();
    }

    private startPolling(): void {
        if (this.pollingInterval) {
            return;
        }
        this.musicPlayer.mediaInfo();
        this.pollingInterval = setInterval(() => this.musicPlayer.mediaInfo(), POLLING_INTERVAL_MS);
    }

    private stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = undefined;
        }
    }
}
