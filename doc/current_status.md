# Estado Actual del Proyecto

> Última actualización: 2026-09-17
>
> Este documento describe qué funciona hoy en el código, qué está a medio implementar y qué falta, independientemente de lo que digan `README.md` o `CHANGELOG.md`. Se excluyen del análisis las carpetas `node_modules` y `out`.

## Resumen general

"Productivity Timer" es una extensión de VSCode que implementa un temporizador tipo Pomodoro (trabajo → descanso → estiramiento) con seguimiento de rachas, puntos y logros, un sistema de alarmas configurable, y un panel de reproductor multimedia (Windows) integrado en la Activity Bar.

## Funcionalidades completas

- **Timer/Pomodoro** (`src/timer.ts`): estados `IDLE`, `WORKING`, `BREAK`, `STRETCHING`, `DAILY_LIMIT`. Cuenta regresiva en la barra de estado; encadena preguntas al usuario al terminar cada etapa (trabajo → ¿descanso?; descanso → ¿estiramiento? → ¿otra sesión?; estiramiento → ¿otra sesión?). `onTimerComplete`/`stopTimer` ya no tienen la condición de carrera original (guarda de reentrada `isFinishing`, estado capturado antes de resetear).
- **Etapa de estiramiento** (`src/timer.ts`, `src/stretchVideos.ts`): duración configurable (`stretchDuration`), sugiere un video de una lista curada o de `stretchVideos` (config del usuario), con confirmación antes de `vscode.env.openExternal`.
- **Rachas, puntos y logros** (`src/dataManager.ts`, `src/WebView/achievementsManager.ts`): cálculo de racha diaria, sistema de puntos y 9 logros desbloqueables.
- **Frases motivacionales** (`src/motivationalQuotes.ts`): frase diaria mostrada al usuario.
- **Alarma local** (`src/alarmManager.ts` + `src/musicPlayer.ts`):
  - Windows: proceso PowerShell persistente (`src/player_bridge.ps1`) que usa `System.Windows.Media.MediaPlayer`, comunicado por JSON vía stdin/stdout. La ruta al script ya no está hardcodeada (se resuelve con `path.join(__dirname, ...)` + copia vía script `postcompile`).
  - macOS/Linux: `afplay` / `ffplay` / `mpg123` / `aplay` según disponibilidad.
  - Se puede consultar si la alarma está sonando (`AlarmManager.isAlarmActive()`).
- **Panel de Estadísticas editable y en vivo** (`src/WebView/panelManager.ts`, `dashboard.ts`, `media/dashboard.*`): HTML separado del TypeScript (CSP + nonce), formularios reales para la alarma (tipo/ruta/volumen, con selector de archivo nativo) y los 4 tiempos, guardado vía `src/configService.ts` (reutilizado también por los comandos nativos de configuración). Se refresca solo (vía `postMessage`) tras completar sesiones o guardar configuración, sin recargar el HTML.
- **Panel de reproductor multi-sesión** (`src/WebView/playerView.ts`, `playerViewProvider.ts`, `media/player.*`, Windows-only): lista **todas** las sesiones de medios activas del sistema (`GetSessions()` de SMTC), no solo la que Windows considera "actual". Cada sesión tiene sus propios controles (anterior/pausar-reanudar como toggle/siguiente) vía los métodos propios de esa sesión SMTC (`TryPlayAsync`/`TryPauseAsync`/`TrySkipNextAsync`/`TrySkipPreviousAsync`). El volumen general sigue siendo un control global vía `SendKeys`. El usuario puede fijar manualmente cuál sesión se destaca como activa haciendo click en el ítem (fuera de los botones).
- **Notificaciones no invasivas** (`src/notify.ts`): los avisos de puro feedback (sin botones) usan `vscode.window.setStatusBarMessage` en vez de `showInformationMessage`, por lo que se autodescartan y no quedan en el historial de Notificaciones de VSCode. Las preguntas Sí/No y los warnings/errores no se tocaron.

## Funcionalidades experimentales / sin probar

- **Alarma vía YouTube y video de estiramiento** (`src/ytdlpManager.ts`, `src/alarmManager.ts`, `src/timer.ts`): yt-dlp ya no requiere instalación manual — la extensión descarga el binario oficial una vez (release fijada por tag + verificación de checksum SHA-256 + consentimiento explícito del usuario) y lo guarda en `globalStorage`. `getStreamUrl()` usa yt-dlp para resolver la URL directa del stream, sin necesidad de pipearlo a través de otro proceso.
  - Para evitar el "Sign in to confirm you're not a bot" del cliente `web` por defecto de YouTube, se fuerzan los clientes `tv,ios,android` (`--extractor-args`); como esos clientes no siempre exponen audio-only, el formato de la alarma usa `bestaudio/best` (con fallback) en vez de `bestaudio` a secas.
  - Alarma de audio: se prioriza `ffplay` si está en el PATH (cualquier sistema operativo); si no, en Windows cae al `MediaPlayer` .NET existente (sin ffmpeg), y en macOS/Linux se avisa que ffmpeg es necesario.
  - Video de estiramiento (`Timer.playStretchVideo()`): si hay `ffplay` disponible, se abre en una ventana nativa externa con el video real; si no, se avisa cómo instalar ffmpeg y se cae al comportamiento anterior (abrir en el navegador).
  - **Confirmado por el usuario** (2026-09-17): descarga real de yt-dlp con verificación de checksum, y reproducción de audio de la alarma en Windows. Pendiente de confirmar la reproducción del video de estiramiento con `ffplay`.
- **Alarma vía Spotify**: parcialmente implementada y sin probar de forma confiable.
  - Windows: abre el URI de Spotify (búsqueda) y envía la tecla Enter vía `SendKeys`, aprovechando que Spotify toma el foco al abrirse.
  - macOS: vía AppleScript.
  - Linux: vía dbus.
  - El flujo OAuth (`Spotify/auth.ts`) obtiene y guarda un token, pero `playSpotify()` todavía no lo consume para reproducir — la reproducción real sigue siendo manual.

**Nota de discrepancia**: `README.md` ya fue actualizado para reflejar que YouTube y Spotify siguen en fase experimental. Este documento es la fuente de verdad más actualizada al respecto.

## Código exploratorio sin conectar

- `src/Spotify/playerManager.ts` (solo código comentado) y `src/Spotify/Local_AND_pwsh.ts` (`SpotifyLocalController`, incluye el enfoque de teclas multimedia que terminó reimplementándose directamente en `player_bridge.ps1`/`musicPlayer.ts` para el panel de reproductor) siguen sin importarse desde `extension.ts`. Pendiente decidir si se conectan o se eliminan.

## Pendiente / no iniciado (roadmap, ver `doc/FEATURES.md`)

- Recordatorio diario vía Task Scheduler de Windows (Feature #3).
- Alarma/recordatorio personalizado de una sola vez (`setCustomReminder`, Feature #4) — pensado para avisar manualmente el reinicio de límites de tokens de IA.
- Notificaciones bloqueantes que no interfieran con el bridge (Feature #5) — marcada explícitamente como pendiente de su propio plan de implementación antes de tocar código, por riesgo de conflicto con la comunicación asíncrona de `player_bridge.ps1`.
- Volumen preciso por sesión en el panel de reproductor — investigado y descartado por ahora: requeriría Core Audio (`IAudioSessionManager2`/`ISimpleAudioVolume`, API COM clásica sin proyección WinRT), con riesgo real de crashear el proceso persistente compartido con la alarma.
- Soporte macOS/Linux para el panel de reproductor y el recordatorio diario.

## Deuda técnica conocida

- Código exploratorio de Spotify sin conectar (ver arriba).
- README/CHANGELOG requieren revisión periódica para no quedar desalineados con el código a medida que se agreguen features (ya ocurrió una vez con Spotify/YouTube).
