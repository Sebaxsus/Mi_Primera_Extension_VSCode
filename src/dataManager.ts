import * as vscode from 'vscode';
import { SpotifyToken } from './Spotify/auth';

export interface SessionData {
    date: string;
    minutesWorked: number;
    sessionsCompleted: number;
}

export interface UserStats {
    totalMinutes: number;
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    points: number;
    lastSessionDate: string;
    sessions: SessionData[];
}

export class DataManager {
    private context: vscode.ExtensionContext;
    private readonly STATS_KEY = 'productivityTimer.stats';
    private readonly SPOTIFY_KEY = 'productivityTimer.spotify';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    getStats(): UserStats {
        const defaultStats: UserStats = {
            totalMinutes: 0,
            totalSessions: 0,
            currentStreak: 0,
            longestStreak: 0,
            points: 0,
            lastSessionDate: '',
            sessions: []
        };

        return this.context.globalState.get(this.STATS_KEY, defaultStats);
    }

    async saveStats(stats: UserStats): Promise<void> {
        await this.context.globalState.update(this.STATS_KEY, stats);
    }

    async addSession(minutes: number): Promise<void> {
        const stats = this.getStats();
        const today = this.getTodayDateString();

        // Actualizar sesión del día
        const todaySession = stats.sessions.find(s => s.date === today);
        if (todaySession) {
            todaySession.minutesWorked += minutes;
            todaySession.sessionsCompleted++;
        } else {
            stats.sessions.push({
                date: today,
                minutesWorked: minutes,
                sessionsCompleted: 1
            });
        }

        // Actualizar totales
        stats.totalMinutes += minutes;
        stats.totalSessions++;

        // Actualizar racha
        this.updateStreak(stats);

        // Calcular puntos
        this.calculatePoints(stats, minutes);

        stats.lastSessionDate = today;

        await this.saveStats(stats);
    }

    private updateStreak(stats: UserStats): void {
        const config = vscode.workspace.getConfiguration('productivityTimer');
        const minimumMinutes = config.get<number>('minimumDailyMinutes', 30);
        
        const today = this.getTodayDateString();
        const yesterday = this.getDateString(new Date(Date.now() - 86400000));

        const todayMinutes = this.getMinutesForDate(stats, today);
        const yesterdayMinutes = this.getMinutesForDate(stats, yesterday);

        // Si cumplimos el mínimo hoy
        if (todayMinutes >= minimumMinutes) {
            // Si es el primer día o continuamos la racha de ayer
            if (!stats.lastSessionDate || stats.lastSessionDate === yesterday || stats.lastSessionDate === today) {
                if (stats.lastSessionDate === yesterday) {
                    stats.currentStreak++;
                } else if (stats.lastSessionDate !== today) {
                    stats.currentStreak = 1;
                }
            } else {
                // Racha rota
                stats.currentStreak = 1;
            }

            // Actualizar racha más larga
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
        }
    }

    private calculatePoints(stats: UserStats, minutes: number): void {
        // Sistema de puntos:
        // 1 punto por minuto trabajado
        // Bonus de 50 puntos por sesión completada
        // Bonus de 100 puntos por día de racha
        
        stats.points += minutes; // Puntos por minutos
        stats.points += 50; // Bonus por sesión

        // Bonus por racha
        if (stats.currentStreak > 1) {
            stats.points += 100;
        }

        // Bonus extra por rachas largas
        if (stats.currentStreak >= 7) {
            stats.points += 200; // Semana completa
        }
        if (stats.currentStreak >= 30) {
            stats.points += 500; // Mes completo
        }
    }

    private getMinutesForDate(stats: UserStats, date: string): number {
        const session = stats.sessions.find(s => s.date === date);
        return session ? session.minutesWorked : 0;
    }

    private getTodayDateString(): string {
        return this.getDateString(new Date());
    }

    private getDateString(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    async resetStats(): Promise<void> {
        const answer = await vscode.window.showWarningMessage(
            '¿Estás seguro de que quieres reiniciar todas las estadísticas?',
            'Sí',
            'No'
        );

        if (answer === 'Sí') {
            await this.context.globalState.update(this.STATS_KEY, undefined);
            vscode.window.showInformationMessage('Estadísticas reiniciadas correctamente');
        }
    }

    getTodayMinutes(): number {
        const stats = this.getStats();
        return this.getMinutesForDate(stats, this.getTodayDateString());
    }

    public async checkStreak() {
        const stats = this.getStats();
        const today = this.getTodayDateString();
        const yesterday = this.getDateString(new Date(Date.now() - 86400000));
        
        // Racha rota
        if (stats.lastSessionDate && stats.lastSessionDate !== yesterday && stats.lastSessionDate !== today) {
            // Actualizar racha más larga
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }

            stats.currentStreak = 0;

            // Actualizando la Racha
            await this.saveStats(stats);
        }
        
    }

    async saveSpotifyData(token: SpotifyToken): Promise<void> {
        await this.context.globalState.update(this.SPOTIFY_KEY, token);
    }
}
