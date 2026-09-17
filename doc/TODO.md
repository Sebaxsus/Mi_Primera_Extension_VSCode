- [x] Agregar un sección de configuración a la Web View, Debe tener la info de La alarma, Tiempo de trabajo, Tiempo de descanso, Mínimo Diario. (Ya estaba implementado en `dashboard.ts`, bloque "Configuración Actual".)
- [x] Implementar una función para reproducir música desde el pwsh. (Se corrigió la ruta hardcodeada de `player_bridge.ps1` en `musicPlayer.ts` — ver NUEVAS — y se agregaron los wrappers `pause()`/`currentSong()`/`isPlaying()` que ya soportaba el bridge pero no se exponían.)
- [x] Probar la función de YT (audio de la alarma). Confirmado por el usuario en Windows — ver `NUEVAS (detectadas en pruebas F5, 2026-09-17)` para los bugs que salieron y se corrigieron en el camino (`src/ytdlpManager.ts`, `src/alarmManager.ts`).
- [ ] Probar el video de estiramiento reproducido dentro de la extensión (`Timer.playStretchVideo()`, ventana `ffplay`) y su fallback a abrir en el navegador cuando falta ffmpeg. Pasos manuales:
  1. Tener `ffmpeg` instalado y en el PATH.
  2. Terminar un descanso (o llamar `startStretch()`) y confirmar "Sí" al video de estiramiento.
  3. Confirmar que se abre una ventana `ffplay` con el video reproduciéndose.
  4. Repetir sin ffmpeg en el PATH y confirmar que cae al navegador con el aviso de instalación.
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
- [x] Los mensajes/notificaciones de feedback (`vscode.window.showInformationMessage` sin botones, usados en `timer.ts`/`alarmManager.ts`/`extension.ts`) no se cierran ni se limpian, y van poblando la sección de Notificaciones de VSCode (el ícono de campana) con historial acumulado sesión tras sesión. (Reemplazados por `showToast()` en `src/notify.ts`, que usa `setStatusBarMessage` — se autodescarta y no aparece en el historial. Las preguntas Sí/No y los warnings/errores quedaron igual.)
- [x] Las notificaciones informativas deberían tener un TTL/auto-cierre explícito manejado por la extensión, en vez de depender del comportamiento por defecto de VSCode, para no saturar el historial de notificaciones. (Resuelto junto con el ítem anterior — `showToast()` recibe un `timeoutMs`.)
- [x] `productivityTimer.stretchDuration` (y `stretchVideos`) no está incluido en el flujo interactivo de `showConfigurationPanel()` (`extension.ts`) — hoy solo se puede cambiar editando `settings.json` directamente. (Agregado al mismo flujo guiado, y también editable desde el propio panel de Estadísticas — ver `NUEVAS` de pruebas F5.)


## NUEVAS (detectadas en revisión de código, 2026-09-12)

- [x] Implementar la etapa de "estiramiento" (nueva sección de timer, configuración y alarma asociada) — actualmente no existe en el código, solo trabajo y descanso. (Ver Feature #1 en `PRÓXIMAS FEATURES`.)
- [ ] Conectar o eliminar `src/Spotify/playerManager.ts` y `src/Spotify/Local_AND_pwsh.ts` (código exploratorio no integrado al flujo principal).
- [x] Quitar la ruta absoluta hardcodeada de `player_bridge.ps1` en `MusicPlayer` (rompe portabilidad entre máquinas). (Ahora se resuelve con `path.join(__dirname, 'player_bridge.ps1')` + script `postcompile` en `package.json` que copia el `.ps1` a `out/`.)
- [x] Actualizar README.md/CHANGELOG.md para reflejar que Spotify y YouTube siguen en fase experimental (ver `doc/current_status.md`). (README.md actualizado con la nota de experimental y link a `doc/current_status.md`.)


## NUEVAS (detectadas en pruebas F5, 2026-09-12)

- [x] El panel de Estadísticas (dashboard) no se actualiza cuando cambian los datos en vivo (completar el mínimo diario, terminar una sesión, etc.). (`panelManager.refreshStatsPanel`/`refreshStatsPanelIfOpen` empujan los datos vía `postMessage` sin recargar el HTML; enganchado tras cada `addSession()` en `timer.ts` y tras cada guardado de config.)
- [x] Arreglar la sección de Alarma del dashboard: hoy es de solo lectura (`dashboard.ts`). (Ahora es un formulario editable — tipo/ruta/volumen — con selector de archivo nativo, usando `src/configService.ts`.)
- [x] Agregar al dashboard controles para configurar los parámetros generales de la extensión (mínimo diario, tiempo de trabajo, tiempo de descanso, estiramiento) directamente desde el webview. (Formulario en `dashboard.ts`, guardado vía `configService.saveGeneralConfig`.)


## NUEVAS (detectadas en pruebas F5, 2026-09-13)

- [x] Footer con botón "⚙️ Configuración" en el panel de reproductor, que abre el dashboard sin pasar por la paleta de comandos. (`src/WebView/playerView.ts`, `media/player.js`, `playerViewProvider.ts` maneja `openDashboard` → ejecuta `productivityTimer.showStats`.)
- [x] Sección de Recordatorio Diario agregada al dashboard: muestra el estado real consultado en vivo con `schtasks /query` (no solo la config guardada) y permite Activar/Cambiar Hora/Desactivar sin salir del panel, reutilizando el mismo flujo de consentimiento nativo que el comando de la paleta. (`src/WebView/dashboard.ts`, `src/WebView/panelManager.ts`, `media/dashboard.js`.)
- [x] Bug: el archivo sidecar (`daily-status.json`) no se refrescaba al cambiar `minimumDailyMinutes` desde el dashboard ni desde el comando nativo de configuración — solo se actualizaba al completar una sesión o al activar la extensión — por lo que el recordatorio diario podía leer un mínimo desactualizado y no disparar la notificación cuando debía. (Se agregó `dataManager.refreshDailyStatusFile()` justo después de `saveGeneralConfig(...)` en `panelManager.ts` y `extension.ts`.)


## PRÓXIMAS FEATURES (roadmap definido, ver `doc/FEATURES.md`)

- [x] Estiramiento con rutinas en video: lista curada de videos de YouTube + config `stretchVideos` para reemplazarla, se abre al iniciar la etapa de estiramiento. (Nuevo estado `STRETCHING` en `src/timer.ts`, encadenado tras el descanso; video elegido al azar de `src/stretchVideos.ts` u override del usuario, con confirmación antes de `vscode.env.openExternal`.)
- [x] Panel de reproductor tipo flyout de Windows: `WebviewViewProvider` persistente, controles por teclas multimedia y metadata de canción vía SMTC (`Windows.Media.Control`) en `player_bridge.ps1`. Windows-only. (Implementado y probado por el usuario vía F5: `src/WebView/playerView.ts`, `playerViewProvider.ts`, comandos `mediaPlayPause`/`mediaNext`/`mediaPrevious`/`mediaVolumeUp`/`mediaVolumeDown`/`mediaInfo` en `player_bridge.ps1`.)
- [x] Recordatorio diario vía Task Scheduler de Windows: script standalone que lee los datos de `dataManager.ts` y notifica si no se cumplió la meta diaria; comandos `enableDailyReminder`/`disableDailyReminder` con consentimiento explícito. Windows-only. (Implementado y probado por el usuario vía F5: script `daily_reminder.ps1` generado en `context.globalStorageUri`, notificación nativa vía `System.Windows.Forms.NotifyIcon.ShowBalloonTip` — los toasts WinRT no se mostraban sin un AppId registrado —, comandos `enableDailyReminder`/`disableDailyReminder` con diálogo modal de consentimiento explícito antes de tocar `schtasks`. Ver `src/dailyReminderManager.ts`.)
- [ ] Alarma/recordatorio personalizado (`setCustomReminder`): generalizar `AlarmManager` para un recordatorio de una sola vez con duración/hora arbitraria, pensado para avisar manualmente el reinicio de límites de tokens de IA.
- [ ] Notificaciones bloqueantes que no interfieran con el bridge: las preguntas de sí/no deben seguir bloqueando el flujo del timer sin afectar la comunicación con `player_bridge.ps1` (ej. el polling del panel de reproductor). **Requiere su propio plan de implementación** antes de tocar código, por el riesgo de conflicto (ver `doc/FEATURES.md` #5).
- [x] Panel de reproductor multi-sesión: listar todas las sesiones de medios activas (`GetSessions()`), destacar visualmente la sesión activa, y controlar cada una (anterior/pausar-reanudar como toggle/siguiente) por separado vía SMTC. Volumen preciso por sesión queda fuera de alcance (requiere Core Audio, ver `doc/FEATURES.md` #6). Probado por el usuario vía F5; además se puede "fijar" manualmente cuál sesión se destaca como activa haciendo click en el ítem (fuera de los botones de control).

## NUEVAS (detectadas en pruebas F5, 2026-09-17)

- [x] Bundlear yt-dlp de forma segura en vez de exigir instalación manual: descarga desde una release fijada de GitHub + verificación de SHA-256 contra el hash oficial + consentimiento explícito del usuario antes de la primera descarga. (`src/ytdlpManager.ts`, nuevo.)
- [x] Video de estiramiento reproducido de verdad dentro de la extensión (ventana `ffplay`) en vez de solo abrir el navegador, con fallback al navegador si falta ffmpeg. (`Timer.playStretchVideo()` en `src/timer.ts`.)
- [x] Bug: `yt-dlp -f bestaudio` fallaba con "Requested format is not available" al forzar los clientes `tv,ios,android` de YouTube (no siempre exponen audio-only). Corregido con fallback `bestaudio/best`. (`src/alarmManager.ts`.)
- [x] Bug: YouTube devolvía "Sign in to confirm you're not a bot" con el cliente `web` por defecto de yt-dlp. Mitigado forzando `--extractor-args youtube:player_client=tv,ios,android`. (`src/ytdlpManager.ts`.)
- [x] Bug: en Windows, `playYouTube` ignoraba ffmpeg aunque estuviera instalado y siempre usaba el `MediaPlayer` .NET. Ahora se prioriza `ffplay` (si está en el PATH) en cualquier sistema operativo, y solo se cae al `MediaPlayer` .NET en Windows cuando ffmpeg no está instalado. (`src/alarmManager.ts`.)
- [x] Aclarado (no es un bug): `ffplay` no aparece en el panel de reproductor propio de la extensión porque no implementa la API SMTC que ese panel usa para listar sesiones — sí aparece en el Mezclador de Volumen nativo de Windows porque ese usa Core Audio a nivel de proceso. Documentado en `doc/FAQ.md`.
- [ ] **Bug reportado por el usuario**: en la única prueba hecha hasta ahora, el video de estiramiento (`ffplay`, `Timer.playStretchVideo()`) se congeló a los ~10s — la imagen quedó fija pero el audio del mismo proceso siguió sonando con normalidad. Aún no reproducido de forma controlada ni diagnosticado a fondo; hipótesis a investigar (no excluyentes):
  1. **Stall/throttling del stream de red**: el video (mucho más pesado que el audio) agota su buffer de decodificación antes que el audio cuando la red se entrecorta — es un síntoma clásico de `ffplay` con streams HTTP progresivos inestables. Posible mitigación: agregar flags de reconexión (`-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5`) al spawn de `ffplay` en `src/timer.ts`.
  2. **Resolución/bitrate excesivo para el hardware**: el selector de formato actual (`best[ext=mp4]/best`) no limita la resolución, por lo que yt-dlp puede resolver a una calidad muy alta (ej. 1080p+) que satura la decodificación por software. Posible mitigación: acotar el formato (ej. `best[height<=720][ext=mp4]/best[height<=720]/best`) en `getStreamUrl(ytDlpPath, video, ...)` dentro de `Timer.playStretchVideo()`.
  3. **Los clientes forzados de YouTube** (`tv,ios,android`, agregados para evitar el bloqueo anti-bot — ver `src/ytdlpManager.ts`) podrían servir el stream de video desde un CDN/política de throttling distinta a la del cliente `web`, más propensa a cortes. Investigar si el problema persiste con otro `player_client` o solo con estos.
  4. Confirmar si el proceso `ffplay` realmente sigue vivo (no crasheó) mientras está congelado — si el video-only decode thread murió pero el proceso y el audio thread siguen corriendo, el síntoma encajaría con un crash aislado del decoder de video en vez de un problema de red.

### Investigación futura (no comprometida)

- [ ] Automatizar la detección del reinicio de límites de tokens de herramientas de IA (hoy no hay API pública confiable; evaluar si en el futuro alguna herramienta expone esta información).
- [ ] Soporte macOS/Linux para el panel de reproductor (SMTC/SendKeys son Windows-only) y para el recordatorio diario (`launchd`/`cron`/`systemd --user timer`).
