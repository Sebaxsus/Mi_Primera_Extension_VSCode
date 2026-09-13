import * as vscode from 'vscode';
import { MusicPlayer } from '../musicPlayer';
import { getPlayerHtml } from './playerView';

const POLLING_INTERVAL_MS = 2000;

/**
 * Vista persistente (activity bar) con controles de reproducción tipo
 * "flyout" de Windows. Reutiliza la misma instancia de `MusicPlayer` (y su
 * proceso de PowerShell persistente) que usa `AlarmManager` para la alarma.
 *
 * Lista todas las sesiones de medios activas del sistema (SMTC), no solo la
 * que Windows considera "actual", y permite controlar cada una por separado.
 */
export class PlayerViewProvider implements vscode.WebviewViewProvider {
    private view: vscode.WebviewView | undefined;
    private pollingInterval: NodeJS.Timeout | undefined;

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly musicPlayer: MusicPlayer
    ) {
        this.musicPlayer.on('event', (response: any) => {
            if (response.event === 'mediaSessions') {
                this.view?.webview.postMessage({
                    command: 'mediaSessions',
                    sessions: response.sessions ?? []
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
                case 'sessionControl':
                    this.musicPlayer.sessionControl(message.sessionId, message.action);
                    break;
                case 'mediaVolumeUp':
                    this.musicPlayer.mediaVolumeUp();
                    break;
                case 'mediaVolumeDown':
                    this.musicPlayer.mediaVolumeDown();
                    break;
                case 'openDashboard':
                    vscode.commands.executeCommand('productivityTimer.showStats');
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
        this.musicPlayer.mediaSessions();
        this.pollingInterval = setInterval(() => this.musicPlayer.mediaSessions(), POLLING_INTERVAL_MS);
    }

    private stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = undefined;
        }
    }
}
