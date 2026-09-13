import * as vscode from 'vscode';

/**
 * Aviso transitorio en la barra de estado, para feedback que no necesita
 * respuesta del usuario (a diferencia de `showInformationMessage` con botones,
 * que sigue siendo la herramienta correcta para preguntas Sí/No).
 *
 * A diferencia de `showInformationMessage`, se autodescarta solo pasado
 * `timeoutMs` y nunca queda en el historial de Notificaciones de VSCode.
 */
export function showToast(message: string, timeoutMs: number = 5000): void {
    vscode.window.setStatusBarMessage(message, timeoutMs);
}
