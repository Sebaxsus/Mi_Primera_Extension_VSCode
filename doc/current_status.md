# Estado Actual del Proyecto

> Última actualización: 2026-09-12
>
> Este documento describe qué funciona hoy en el código, qué está a medio implementar y qué falta, independientemente de lo que digan `README.md` o `CHANGELOG.md`. Se excluyen del análisis las carpetas `node_modules` y `out`.

## Resumen general

"Productivity Timer" es una extensión de VSCode que implementa un temporizador tipo Pomodoro con seguimiento de rachas, puntos y logros, y un sistema de alarmas configurable (sonido local, YouTube o Spotify) para avisar el cambio entre etapas.

## Funcionalidades completas

- **Timer/Pomodoro** (`src/timer.ts`): estados `IDLE`, `WORKING`, `BREAK`, `DAILY_LIMIT`; cuenta regresiva en la barra de estado; comandos para iniciar sesión de trabajo, iniciar descanso, detener el temporizador y establecer el límite diario; encadena preguntas al usuario ("¿iniciar descanso?", "¿otra sesión?") al terminar cada etapa.
- **Rachas, puntos y logros** (`src/dataManager.ts`, `src/WebView/achievementsManager.ts`): cálculo de racha diaria, sistema de puntos y 9 logros desbloqueables, usados en el panel de estadísticas (`src/WebView/dashboard.ts`).
- **Frases motivacionales** (`src/motivationalQuotes.ts`): frase diaria mostrada al usuario.
- **Alarma local** (`src/alarmManager.ts` + `src/musicPlayer.ts`):
  - Windows: proceso PowerShell persistente (`src/player_bridge.ps1`) que usa `System.Windows.Media.MediaPlayer`, comunicado por JSON vía stdin/stdout. Ya **no depende de ffmpeg** como se planteaba en la idea original del proyecto.
  - macOS/Linux: `afplay` / `ffplay` / `mpg123` / `aplay` según disponibilidad.

## Funcionalidades experimentales / sin probar

- **Alarma vía YouTube**: implementada usando `yt-dlp | ffplay`, pero el propio `TODO.md` indica que aún no se probó en la práctica.
- **Alarma vía Spotify**: parcialmente implementada y sin probar de forma confiable.
  - Windows: abre el URI de Spotify (búsqueda) y envía la tecla Enter vía `SendKeys`, aprovechando que Spotify toma el foco al abrirse.
  - macOS: vía AppleScript.
  - Linux: vía dbus.

**Nota de discrepancia**: `README.md` y `CHANGELOG.md` presentan Spotify y YouTube como integraciones terminadas. En la práctica, el código y el `TODO.md` interno indican que ambas siguen en fase experimental. Este documento es la fuente de verdad más actualizada al respecto.

## En refactor activo (cambios sin commitear al momento de este análisis)

- **Módulo Spotify en reestructuración**: `src/Spotify/playerManager.ts` contiene por ahora solo código comentado (una copia previa del flujo de configuración de Spotify), y `src/Spotify/Local_AND_pwsh.ts` (`SpotifyLocalController`) es código exploratorio que todavía no se importa ni se usa desde `src/extension.ts`.
- **Extracción de estilos del WebView**: `src/WebView/index.css` (archivo nuevo) extrae a una hoja de estilos aparte el CSS que antes vivía embebido como string en `src/WebView/dashboard.ts`.
- **Ajustes menores**: cambios de texto/etiquetas pendientes en `dashboard.ts`, comentario aclaratorio en `player_bridge.ps1`, y un `await` agregado a `saveSpotifyData` en `extension.ts`.

## Pendiente / no iniciado

- **Etapa de estiramiento**: no existe en el código actual (ni en `package.json`, ni en `timer.ts`, ni documentada en el README), a pesar de ser parte de la visión original del proyecto (trabajo → descanso → estiramiento). Hoy el timer solo maneja trabajo y descanso.

## Deuda técnica conocida

- `MusicPlayer` tiene **hardcodeada una ruta absoluta** al script `player_bridge.ps1` en el disco del autor, lo que impide que el proyecto funcione en otra máquina sin editar el código.
- El propio `timer.ts` tiene comentarios del autor admitiendo que el flujo de `stopTimer` / `onTimerComplete` es frágil y necesita revisión (ver sección FIXES de `TODO.md`).
- No hay un estado explícito que indique si la alarma se está reproduciendo o no.
