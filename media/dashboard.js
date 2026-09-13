// Este código corre DENTRO del Webview
const vscode = acquireVsCodeApi();

function solicitarPrueba() {
    vscode.postMessage({
        command: 'ejecutarAlarma'
    });
}

document.getElementById('probar-alarma-btn')?.addEventListener('click', solicitarPrueba);
