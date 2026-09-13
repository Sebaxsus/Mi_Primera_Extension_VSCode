- [x] Agregar un sección de configuración a la Web View, Debe tener la info de La alarma, Tiempo de trabajo, Tiempo de descanso, Mínimo Diario. (Ya estaba implementado en `dashboard.ts`, bloque "Configuración Actual".)
- [x] Implementar una función para reproducir música desde el pwsh. (Se corrigió la ruta hardcodeada de `player_bridge.ps1` en `musicPlayer.ts` — ver NUEVAS — y se agregaron los wrappers `pause()`/`currentSong()`/`isPlaying()` que ya soportaba el bridge pero no se exponían.)
- [ ] Probar la función de YT. Pasos manuales (no se puede automatizar desde esta sesión):
  1. Instalar `yt-dlp` y `ffmpeg` (incluye `ffplay`) y verificar que estén en el PATH.
  2. Configurar `productivityTimer.alarmType` en `"youtube"` y `productivityTimer.alarmPath` con una URL válida de YouTube (comando "🔊 Configurar Sonido de Alarma").
  3. Ejecutar "🔊 Probar el Sonido de Alarma" y confirmar que se escucha audio; si falla, ahora debería mostrar un error concreto (se agregó captura de `stderr`/código de salida de `yt-dlp`) en vez de fallar en silencio.
- [ ] Probar la función de Spotify (Incluyendo el Auth Supongo). Pasos manuales (no se puede automatizar desde esta sesión):
  1. Crear una app en developer.spotify.com y registrar el Redirect URI exacto `http://127.0.0.1:5000/callback/`.
  2. Configurar `client_id`/`client_secret` desde el flujo de configuración de Spotify de la extensión.
  3. Tener Spotify Desktop abierto (el control actual es `Start-Process` + tecla Enter simulada, no usa el token OAuth).
  4. Importante: el token OAuth se obtiene y se guarda, pero `playSpotify()` no lo consume todavía para reproducir — la reproducción real sigue siendo manual. Ver ítem de NUEVAS sobre conectar `Local_AND_pwsh.ts`.
- [x] Refactorizar el WebView de Extension y separarlo. (Se creó `src/WebView/panelManager.ts` con `createStatsPanel(...)`; `extension.ts` solo delega la llamada.)
- [x] Separar el HTML String de la función de WebView para mejorar su mantenibilidad. (Estilos movidos a `media/dashboard.css` y script a `media/dashboard.js`, cargados vía `webview.asWebviewUri` con Content-Security-Policy y nonce; se retiró el `src/WebView/index.css` huérfano.)


## FIXES

- [x] En el timer cambiar el stopTimer, y onTimerFinish. (`onTimerComplete` ahora captura el estado antes de llamar `stopTimer()` y tiene guarda de reentrada `isFinishing`; `stopTimer()` ya puede resetear `state` a IDLE siempre sin romper el flujo de finalización. Ver `src/timer.ts`.)
- [x] Incluir un Estado para la alarma con el fin de determinar si se esta ejecutando o no. (`AlarmManager.isAlarmActive()` + `MusicPlayer.isPlaying()`, ver `src/alarmManager.ts` y `src/musicPlayer.ts`.)


## NUEVAS (detectadas en revisión de código, 2026-09-12)

- [ ] Implementar la etapa de "estiramiento" (nueva sección de timer, configuración y alarma asociada) — actualmente no existe en el código, solo trabajo y descanso.
- [ ] Conectar o eliminar `src/Spotify/playerManager.ts` y `src/Spotify/Local_AND_pwsh.ts` (código exploratorio no integrado al flujo principal).
- [x] Quitar la ruta absoluta hardcodeada de `player_bridge.ps1` en `MusicPlayer` (rompe portabilidad entre máquinas). (Ahora se resuelve con `path.join(__dirname, 'player_bridge.ps1')` + script `postcompile` en `package.json` que copia el `.ps1` a `out/`.)
- [ ] Actualizar README.md/CHANGELOG.md para reflejar que Spotify y YouTube siguen en fase experimental (ver `doc/current_status.md`).


## NUEVAS (detectadas en pruebas F5, 2026-09-12)

- [ ] El panel de Estadísticas (dashboard) no se actualiza cuando cambian los datos en vivo (completar el mínimo diario, terminar una sesión, etc.) — hay que agregar una función de refresco/actualización que se pueda invocar después de esos eventos, sin obligar al usuario a cerrar y reabrir el panel. Reutilizar `createStatsPanel`/`getStatsHtml` (`src/WebView/panelManager.ts`), guardando la referencia al `panel` para volver a asignar `panel.webview.html` o, mejor, enviar los datos actualizados vía `panel.webview.postMessage(...)` y refrescar el DOM desde `media/dashboard.js` sin recargar todo el HTML.
- [ ] Arreglar la sección de Alarma del dashboard: hoy es de solo lectura (`dashboard.ts`), hay que permitir configurar el Tipo y la URI/ruta directamente ahí (inputs/`<select>` en el HTML + mensaje `postMessage` manejado en `panelManager.ts`). Reutilizar la lógica ya existente de `configureSoundAlarm()` en `extension.ts` en vez de duplicarla.
- [ ] Agregar al dashboard controles para configurar los parámetros generales de la extensión (mínimo diario, tiempo de trabajo, tiempo de descanso) directamente desde el webview. Reutilizar la lógica ya existente de `showConfigurationPanel()` en `extension.ts` en vez de duplicarla.


## PRÓXIMAS FEATURES (roadmap definido, ver `doc/FEATURES.md`)

- [ ] Estiramiento con rutinas en video: lista curada de videos de YouTube + config `stretchVideos` para reemplazarla, se abre al iniciar la etapa de estiramiento.
- [ ] Panel de reproductor tipo flyout de Windows: `WebviewViewProvider` persistente, controles por teclas multimedia y metadata de canción vía SMTC (`Windows.Media.Control`) en `player_bridge.ps1`. Windows-only.
- [ ] Recordatorio diario vía Task Scheduler de Windows: script standalone que lee los datos de `dataManager.ts` y notifica si no se cumplió la meta diaria; comandos `enableDailyReminder`/`disableDailyReminder` con consentimiento explícito. Windows-only.
- [ ] Alarma/recordatorio personalizado (`setCustomReminder`): generalizar `AlarmManager` para un recordatorio de una sola vez con duración/hora arbitraria, pensado para avisar manualmente el reinicio de límites de tokens de IA.

### Investigación futura (no comprometida)

- [ ] Automatizar la detección del reinicio de límites de tokens de herramientas de IA (hoy no hay API pública confiable; evaluar si en el futuro alguna herramienta expone esta información).
- [ ] Soporte macOS/Linux para el panel de reproductor (SMTC/SendKeys son Windows-only) y para el recordatorio diario (`launchd`/`cron`/`systemd --user timer`).
