- [ ] Agregar un sección de configuración a la Web View, Debe tener la info de La alarma, Tiempo de trabajo, Tiempo de descanso, Mínimo Diario.
- [ ] Implementar una función para reproducir música desde el pwsh.
- [ ] Probar la función de YT.
- [ ] Probar la función de Spotify (Incluyendo el Auth Supongo).
- [ ] Refactorizar el WebView de Extension y separarlo.
- [ ] Separar el HTML String de la función de WebView para mejorar su mantenibilidad


## FIXES

- [ ] En el timer cambiar el stopTimer, y onTimerFinish
- [ ] Incluir un Estado para la alarma con el fin de determinar si se esta ejecutando o no.


## NUEVAS (detectadas en revisión de código, 2026-09-12)

- [ ] Implementar la etapa de "estiramiento" (nueva sección de timer, configuración y alarma asociada) — actualmente no existe en el código, solo trabajo y descanso.
- [ ] Conectar o eliminar `src/Spotify/playerManager.ts` y `src/Spotify/Local_AND_pwsh.ts` (código exploratorio no integrado al flujo principal).
- [ ] Quitar la ruta absoluta hardcodeada de `player_bridge.ps1` en `MusicPlayer` (rompe portabilidad entre máquinas).
- [ ] Actualizar README.md/CHANGELOG.md para reflejar que Spotify y YouTube siguen en fase experimental (ver `doc/current_status.md`).


## PRÓXIMAS FEATURES (roadmap definido, ver `doc/FEATURES.md`)

- [ ] Estiramiento con rutinas en video: lista curada de videos de YouTube + config `stretchVideos` para reemplazarla, se abre al iniciar la etapa de estiramiento.
- [ ] Panel de reproductor tipo flyout de Windows: `WebviewViewProvider` persistente, controles por teclas multimedia y metadata de canción vía SMTC (`Windows.Media.Control`) en `player_bridge.ps1`. Windows-only.
- [ ] Recordatorio diario vía Task Scheduler de Windows: script standalone que lee los datos de `dataManager.ts` y notifica si no se cumplió la meta diaria; comandos `enableDailyReminder`/`disableDailyReminder` con consentimiento explícito. Windows-only.
- [ ] Alarma/recordatorio personalizado (`setCustomReminder`): generalizar `AlarmManager` para un recordatorio de una sola vez con duración/hora arbitraria, pensado para avisar manualmente el reinicio de límites de tokens de IA.

### Investigación futura (no comprometida)

- [ ] Automatizar la detección del reinicio de límites de tokens de herramientas de IA (hoy no hay API pública confiable; evaluar si en el futuro alguna herramienta expone esta información).
- [ ] Soporte macOS/Linux para el panel de reproductor (SMTC/SendKeys son Windows-only) y para el recordatorio diario (`launchd`/`cron`/`systemd --user timer`).