import * as child_process from 'child_process';

/**
 * Verifica si un comando/ejecutable existe en el PATH del sistema.
 * Usado para detectar `ffplay` (y otros reproductores) antes de intentar usarlos.
 */
export function commandExists(command: string): boolean {
    try {
        const platform = process.platform;
        const checkCommand = platform === 'win32' ? 'where' : 'which';
        child_process.execSync(`${checkCommand} ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}
