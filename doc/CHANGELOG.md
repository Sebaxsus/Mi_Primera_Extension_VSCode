# Changelog

## [Unreleased] - 2026-09-13

### ✨ Nuevas Características

- 🎛️ Panel de reproductor tipo flyout de Windows en la activity bar
  - Controles de play/pausa/siguiente/anterior/volumen (afectan al reproductor activo del sistema: Spotify, navegador, etc.)
  - Título y artista de la canción actual en vivo, vía SMTC (`Windows.Media.Control`)
  - Windows-only
- 🧘 Etapa de estiramiento en el ciclo del Pomodoro
  - Se ofrece automáticamente al terminar un descanso
  - Duración configurable (`productivityTimer.stretchDuration`)
  - Sugiere un video de rutina de estiramiento (lista curada por defecto o `productivityTimer.stretchVideos`), con confirmación antes de abrirlo en el navegador
- 🎚️ Panel de reproductor multi-sesión: lista todas las apps con audio activo (no solo la "actual" según Windows), cada una con sus propios controles (anterior/pausar-reanudar/siguiente); se puede elegir manualmente cuál destacar como activa haciendo click en la sesión
- ⏰ Recordatorio diario vía Task Scheduler (Windows)
  - Comandos `⏰ Activar Recordatorio Diario` / `⏰ Desactivar Recordatorio Diario`, con un diálogo modal que muestra el comando exacto de `schtasks` antes de registrar la tarea
  - Notifica con un balloon tip nativo (`NotifyIcon`) si no se cumplió el mínimo diario, incluso con VS Code cerrado (siempre que haya sesión iniciada en Windows)
  - Nueva config `productivityTimer.dailyReminderTime`
  - Configurable también desde el propio dashboard, con el estado real consultado en vivo (`schtasks /query`)

### 🔧 Mejoras

- Panel de Estadísticas (WebView) refactorizado: HTML separado del TypeScript, estilos y script externos (`media/dashboard.css`/`dashboard.js`) con Content-Security-Policy y nonce
- Panel de Estadísticas ahora permite editar la alarma (tipo/ruta/volumen) y los tiempos (trabajo/descanso/mínimo diario/estiramiento) directamente desde el panel, y se actualiza en vivo sin cerrarlo/reabrirlo
- Panel de Estadísticas: nueva tarjeta de Recordatorio Diario para activarlo/cambiarle la hora/desactivarlo sin salir del panel
- Panel de reproductor: nuevo footer con botón "⚙️ Configuración" que abre el dashboard directamente
- `MusicPlayer`: se corrigió la ruta hardcodeada de `player_bridge.ps1` (ahora portable entre máquinas) y se agregaron `pause()`, `currentSong()`, `isPlaying()`
- Alarma de YouTube: validación de `ffplay` y mensajes de error concretos cuando `yt-dlp` falla, en vez de fallar en silencio
- Estado de la alarma consultable (`AlarmManager.isAlarmActive()`)
- Notificaciones de puro aviso (sin botones) ya no se acumulan en el historial de Notificaciones de VSCode: pasan a mostrarse como mensajes transitorios en la barra de estado

### 🐛 Correcciones

- Timer: se corrigió una condición de carrera entre `stopTimer()` y la finalización normal de una etapa (`onTimerComplete`) que podía romper el flujo o duplicar el mensaje de "Temporizador detenido"
- Spotify: se corrigió el `redirectUri` por defecto inconsistente en `Spotify/auth.ts`
- Recordatorio diario: el archivo sidecar (`daily-status.json`) no se refrescaba al cambiar `minimumDailyMinutes` desde el dashboard ni desde el comando nativo de configuración, por lo que el script del recordatorio podía leer un mínimo desactualizado y no notificar cuando correspondía

## [1.0.0] - 2024-02-03

### ✨ Características Iniciales

- 🍅 Temporizador Pomodoro personalizable
  - Sesiones de trabajo configurables
  - Descansos configurables
  - Límite de programación diario

- 💬 Sistema de frases motivacionales
  - Frase diferente cada día
  - Más de 40 frases inspiradoras
  - Se muestra al abrir VS Code

- 🔥 Sistema de rachas
  - Contabiliza días consecutivos
  - Racha actual y récord
  - Mínimo de minutos configurable

- ⭐ Sistema de puntos
  - Puntos por minutos trabajados
  - Bonus por sesiones completadas
  - Bonus por mantener rachas
  - Múltiples logros desbloqueables

- 🔊 Alarmas personalizables
  - Soporte para archivos locales
  - Integración con YouTube (requiere yt-dlp + ffmpeg)
  - Integración con Spotify
  - Control de volumen

- 📊 Panel de estadísticas
  - Vista completa de rachas
  - Puntos totales
  - Historial de sesiones
  - Logros desbloqueados

- 💻 Interfaz integrada
  - Indicador en barra de estado
  - Comandos de paleta
  - Configuración visual

### 🐛 Correcciones

- Ninguna (versión inicial)

### 🔧 Mejoras

- Ninguna (versión inicial)
