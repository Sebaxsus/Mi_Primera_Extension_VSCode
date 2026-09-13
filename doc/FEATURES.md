# Roadmap de Funcionalidades

> Última actualización: 2026-09-12
>
> Este documento define el alcance de las próximas funcionalidades antes de implementarlas. Cada una se planifica e implementa en una sesión separada; aquí solo se deja registrado qué se reutiliza del código existente, qué hay que construir desde cero, y qué queda explícitamente fuera de alcance por ahora. Ver `doc/current_status.md` para el estado del código al momento de escribir esto.

## 1. Estiramiento con rutinas en video

**Objetivo**: al llegar la etapa de "estiramiento" del timer, mostrarle al usuario un video con una rutina guiada, en lugar de dejarlo sin indicación de qué estiramientos hacer.

**Qué se reutiliza**: el ciclo de estados del timer (`src/timer.ts`) y el patrón de configuración por `productivityTimer.*` en `package.json`.

**Qué hay que construir**:
- Nuevo estado de timer para "estiramiento" (hoy el ciclo solo maneja trabajo y descanso).
- Config `productivityTimer.stretchDuration` (duración de la etapa).
- Lista curada fija de 3-5 rutinas de estiramiento en YouTube (cuello, espalda, muñecas — pensadas para programadores).
- Config `productivityTimer.stretchVideos` (array de URLs): si el usuario la completa, reemplaza la lista por defecto.
- Al iniciar la etapa, abrir el link elegido con `vscode.env.openExternal`, además de sonar la alarma normal de cambio de etapa.

**Alcance/limitaciones**: sin selección inteligente (por grupo muscular, historial, etc.) en esta iteración — solo lista fija o reemplazo manual.

---

## 2. Panel de reproductor tipo flyout de Windows

**Objetivo**: una pestaña/panel dentro de VSCode con controles de reproducción (play/pausa/siguiente/anterior/volumen) y el nombre de la canción/artista sonando actualmente, similar al flyout multimedia de Windows.

**Qué se reutiliza**:
- Control de reproducción global (play/pausa/siguiente/anterior/volumen) vía teclas multimedia (`SendKeys`) ya implementado en `src/Spotify/Local_AND_pwsh.ts` — funciona con cualquier reproductor activo en Windows, sin necesitar OAuth.
- El proceso PowerShell persistente y protocolo JSON stdin/stdout de `src/player_bridge.ps1` (mismo patrón que ya usa `MusicPlayer` para la alarma local).

**Qué hay que construir**:
- Infraestructura de vista persistente: contribución `viewsContainers`/`views` en `package.json` + un `WebviewViewProvider` registrado en `src/extension.ts` (hoy solo existe un panel efímero vía comando, `createWebviewPanel`).
- Metadata real de la canción (título/artista): agregar a `player_bridge.ps1` un comando que consulte `GlobalSystemMediaTransportControlsSessionManager` (SMTC, `Windows.Media.Control` vía WinRT) — la misma API que alimenta el flyout nativo de Windows. Se eligió esta opción en vez del parseo frágil de título de ventana o de terminar el OAuth de Spotify Web API.
- Actualización en vivo del panel: polling periódico desde la extensión hacia el bridge, empujado al webview vía `postMessage` (hoy no existe ningún mecanismo push de estado).

**Alcance/limitaciones**: **Windows-only** (SMTC y `SendKeys` son APIs de Windows). No se define soporte macOS/Linux en esta iteración.

---

## 3. Recordatorio diario vía Task Scheduler (Windows-only)

**Objetivo**: avisar al usuario si todavía no hizo su sesión mínima de código del día, incluso con VSCode cerrado.

**Qué se reutiliza**: `dataManager.getTodayMinutes()` y la config `productivityTimer.minimumDailyMinutes` (`src/dataManager.ts`) ya permiten calcular si se cumplió la meta diaria — no hace falta nueva persistencia.

**Qué hay que construir**:
- Un script PowerShell standalone (mismo patrón que `player_bridge.ps1`) que lea el archivo de datos ya persistido por `dataManager.ts` y, si no se cumplió la meta, dispare una notificación nativa de Windows (toast).
- Comandos `productivityTimer.enableDailyReminder` / `disableDailyReminder` que registren/eliminen una tarea en el Task Scheduler de Windows (`schtasks` / `Register-ScheduledTask`), **solo con consentimiento explícito** del usuario, mostrando el comando exacto y la ruta del script antes de ejecutarlo.
- `disableDailyReminder` debe dejar el sistema limpio (eliminar la tarea programada).

**Riesgos a documentar en la UI de consentimiento**: si el usuario desinstala la extensión sin ejecutar `disableDailyReminder` antes, la tarea programada queda huérfana ejecutándose indefinidamente.

**Alcance/limitaciones**: **Windows-only** por ahora (Task Scheduler). Soporte para macOS (`launchd`) y Linux (`cron`/`systemd --user timer`) queda como trabajo futuro.

---

## 4. Alarma/recordatorio personalizado

**Objetivo**: permitir al usuario crear un recordatorio de una sola vez, independiente del ciclo trabajo/descanso/estiramiento. Caso de uso principal: cuando el usuario ve en la interfaz de una herramienta de IA (ej. Claude Code) que faltan N horas para que se reinicien sus límites de uso, puede establecer manualmente una alarma para ese momento.

**Qué se reutiliza**: la reproducción de alarma ya implementada en `AlarmManager` (`src/alarmManager.ts`) — local/YouTube/Spotify — sin duplicar lógica de audio.

**Qué hay que construir**:
- Generalizar `AlarmManager`/el timer para soportar un recordatorio de una sola vez con duración o fecha/hora arbitraria, no ligado a las etapas normales del pomodoro.
- Nuevo comando `productivityTimer.setCustomReminder` con un input box para que el usuario ingrese la duración (ej. "3 horas") o la hora puntual.

**Fuera de alcance ahora**: automatizar la lectura del tiempo real de reinicio de tokens de una IA (no existe API pública para esto; alternativas como leer archivos de estado no documentados o automatizar la UI de otra aplicación se consideran poco confiables o invasivas). Se deja como idea de investigación futura, no como tarea comprometida.

---

## 5. Notificaciones bloqueantes que no interfieran con el bridge

> ⚠️ Detectada en pruebas F5 (2026-09-12). **Requiere su propio plan de implementación** antes de tocar código — se marca aquí solo como definición inicial, dado el riesgo de conflicto con la comunicación asíncrona del bridge de PowerShell.

**Objetivo**: las notificaciones que necesitan una respuesta del usuario (ej. "¿Quieres iniciar un descanso?", "¿Abrir video de estiramiento?") deben bloquear el flujo del timer (como ya ocurre hoy, vía `await showInformationMessage(...)`) **sin** bloquear ni degradar la comunicación con el proceso persistente de PowerShell (`player_bridge.ps1`) — por ejemplo, el polling de `mediaInfo()` del panel de reproductor (`src/WebView/playerViewProvider.ts`) no debería quedar congelado mientras el usuario tiene un diálogo de sí/no pendiente.

**Por qué es conflictiva**: Node.js es de un solo hilo — un `await` sobre un diálogo de VSCode no debería bloquear el event loop en teoría (las promesas de la API de VSCode no son bloqueantes a nivel de proceso), pero hay que verificar con cuidado que no haya algún punto donde el flujo del `Timer`/`AlarmManager` termine serializando accidentalmente el acceso al `MusicPlayer` compartido (ej. si se reutiliza una única cola de comandos o el mismo `stdin` sin proteger contra escrituras concurrentes desde dos features distintas al mismo tiempo).

**Qué habría que investigar/construir** (a definir en el plan dedicado):
- Confirmar (con pruebas) si hoy ya hay o no interferencia real entre un diálogo pendiente y el polling del reproductor.
- Si la hay, diseñar un mecanismo de cola o de prioridad para los comandos enviados a `player_bridge.ps1` (ej. que las preguntas de sí/no no dependan de ningún round-trip con el bridge, y que el polling siga corriendo en paralelo sin esperar al diálogo).

**Alcance/limitaciones**: no se compromete ningún diseño concreto todavía — esta entrada es solo el registro de la preocupación para no perderla, hasta que se planifique en detalle.

---

## 6. Panel de reproductor multi-sesión (todas las apps con audio)

**Objetivo**: extender el panel de reproductor (Feature #2) para mostrar **todas** las sesiones de medios activas del sistema (ej. Chrome y Spotify sonando a la vez), no solo la que Windows considera "actual", permitiendo controlar cada una por separado.

**Qué se reutiliza**: la infraestructura completa de la Feature #2 (`player_bridge.ps1`, `MusicPlayer` como `EventEmitter`, `PlayerViewProvider`, `media/player.*`) — esto es una extensión, no un panel nuevo.

**Qué hay que construir**:
- `player_bridge.ps1`: nuevo comando `mediaSessions` que, además de `GetCurrentSession()` (ya usado por `mediaInfo`), llama `$smtcManager.GetSessions()` para listar **todas** las sesiones activas (título/artista/estado/`SourceAppUserModelId` de cada una), identificando cuál coincide con la sesión "activa" según Windows. Se cachean las sesiones devueltas (por id) para poder targetear una en particular en el siguiente comando.
- Nuevo comando de control por sesión (ej. `sessionControl` con `sessionId` + `action`: `play`/`pause`/`next`/`previous`) que invoca los métodos propios de esa sesión de SMTC (`TryPlayAsync`/`TryPauseAsync`/`TrySkipNextAsync`/`TrySkipPreviousAsync`) — control preciso por app, a diferencia del `SendKeys` global que ya existe (que sigue afectando "lo que Windows considere activo", no una sesión puntual).
- UI del panel: lista de sesiones (la activa primero, destacada con una clase CSS distinta — ej. borde/fondo diferenciado —, seguida del resto de `GetSessions()`); cada ítem de la lista tiene sus propios botones: anterior (⏮), pausar (⏸), reanudar (▶), siguiente (⏭).
- Los botones de volumen general (`SendKeys` `VK_VOLUME_UP`/`VK_VOLUME_DOWN`) se mantienen como controles globales del panel (no por sesión).

**Fuera de alcance (decisión explícita)**: volumen preciso por sesión/aplicación. Investigado y descartado por ahora: requiere Core Audio (`IAudioSessionManager2`/`ISimpleAudioVolume`), una API COM clásica sin proyección WinRT — a diferencia de SMTC, implica redefinir interfaces COM a mano en PowerShell (GUIDs exactos, orden de vtable exacto), con riesgo real de crashear el proceso persistente compartido con la alarma si algo se define mal, y sin mapeo confiable garantizado entre `SourceAppUserModelId` (SMTC) y `ProcessId` (Core Audio) para apps multi-proceso como los navegadores. Se documenta como investigación futura, no como tarea comprometida.

**Alcance/limitaciones**: Windows-only, igual que la Feature #2.
