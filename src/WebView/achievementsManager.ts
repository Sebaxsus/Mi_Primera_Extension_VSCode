import type { UserStats } from "../dataManager"; // Se usa la plabra clave Type, para asegurar que al compilar el tipo no se agregue a este archivo
// TypeScript 3.8+ permite import type para asegurar que la importación sea solo para comprobación de tipos y no genere código. 

/**
 * Se encarga de asignar los logros con base en las estadisticas del Usuario,
 * devuelve todos los logros en un string con el fin de usarlo dentro del **String HTML o Raw HTML**
 * 
 * ### TODO
 * - [ ] Guardar los logros a el estado Global (Persistir los datos en un LocalStorage???)
 * @param {UserStats} stats  
 * @returns {string}
 */
export function getAchievementsHtml(stats: UserStats): string {
    const achievements = [];
    
    if (stats.currentStreak >= 1) {
        achievements.push('<div class="achievement">🎯 Primera Racha</div>');
    }
    if (stats.currentStreak >= 7) {
        achievements.push('<div class="achievement">🌟 Semana Completa</div>');
    }
    if (stats.currentStreak >= 30) {
        achievements.push('<div class="achievement">👑 Mes Completo</div>');
    }
    if (stats.currentStreak >= 100) {
        achievements.push('<div class="achievement">💎 Centenario</div>');
    }
    if (stats.points >= 1000) {
        achievements.push('<div class="achievement">🏆 1K Puntos</div>');
    }
    if (stats.points >= 10000) {
        achievements.push('<div class="achievement">💰 10K Puntos</div>');
    }
    if (stats.totalSessions >= 50) {
        achievements.push('<div class="achievement">🎪 50 Sesiones</div>');
    }
    if (stats.totalSessions >= 100) {
        achievements.push('<div class="achievement">🚀 100 Sesiones</div>');
    }
    if (stats.totalMinutes >= 1000) {
        achievements.push('<div class="achievement">⏰ 1000 Minutos</div>');
    }

    return achievements.length > 0 
        ? achievements.join('') 
        : '<div class="stat-label">Completa sesiones para desbloquear logros</div>';
}