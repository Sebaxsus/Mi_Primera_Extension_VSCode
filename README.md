# 🍅 Productivity Timer - Pomodoro & Motivación

Una extensión completa de Visual Studio Code que te ayuda a mantener el enfoque, construir rachas de programación y mantenerte motivado con un sistema de gamificación — con estiramiento incluido y un panel de reproductor multimedia integrado.

## ✨ Características

### 🎯 Temporizador Pomodoro Personalizable
- **Sesiones de trabajo**: Define cuánto tiempo quieres programar (por defecto 30 minutos)
- **Descansos**: Establece períodos de descanso (por defecto 10 minutos)
- **Estiramiento**: Al terminar un descanso, se ofrece una pausa de estiramiento (por defecto 5 minutos) con una rutina en video sugerida
- **Límite diario**: Establece un objetivo de programación para el día
- **Notificaciones**: Avisos breves en la barra de estado al terminar cada etapa (no saturan el historial de Notificaciones de VS Code)

### 🧘 Estiramiento con Rutinas en Video
- Se ofrece automáticamente después de cada descanso
- Sugiere un video corto de estiramiento (cuello, espalda, muñecas) elegido al azar de una lista curada, con confirmación antes de abrirlo en el navegador
- Puedes reemplazar la lista por tus propios videos de YouTube

### 🎚️ Panel de Reproductor (Windows)
Un panel propio en la Activity Bar que funciona como el flyout multimedia de Windows:
- Lista **todas** las aplicaciones que están reproduciendo audio a la vez (ej. Spotify y el navegador simultáneamente), no solo la que Windows considera "actual"
- Controles independientes por sesión: anterior, pausar/reanudar (según el estado real) y siguiente
- Puedes elegir manualmente cuál sesión destacar como activa haciendo click en ella
- Botones de volumen general del sistema
- **Requiere Windows** (usa la API SMTC de `Windows.Media.Control`)

### ⏰ Recordatorio Diario (Windows)
Registra una tarea en el Task Scheduler de Windows para avisarte si no completaste tu sesión mínima del día, incluso con VS Code cerrado:
- Comandos `⏰ Activar Recordatorio Diario` / `⏰ Desactivar Recordatorio Diario`, también disponibles desde el propio panel de Estadísticas
- Antes de tocar el Task Scheduler, te muestra el comando exacto que se va a ejecutar y pide confirmación explícita
- Se ejecuta solo si tienes sesión iniciada en Windows a la hora programada (no requiere guardar contraseña ni privilegios de administrador)
- **Requiere Windows**

### 🔥 Sistema de Rachas
- Contabiliza días consecutivos de programación
- Establece un mínimo de minutos diarios para mantener tu racha
- Visualiza tu racha actual y la más larga alcanzada

### ⭐ Sistema de Puntos
- Gana puntos por cada minuto programado
- Bonus por completar sesiones
- Bonus adicionales por mantener rachas
- Logros desbloqueables basados en tu progreso

### 💬 Frases Motivacionales
- Una frase motivacional diferente cada día al abrir VS Code
- Más de 40 frases inspiradoras para mantenerte motivado

### 🔊 Alarmas Personalizables
Elige cómo quieres ser notificado al terminar cada etapa:

1. **Archivo Local**: Usa cualquier archivo de audio (.mp3, .wav, .ogg, etc.) — funcional y probado en Windows/macOS/Linux **[MediaPlayer Win][1]**
2. **YouTube**: Reproduce música o sonidos desde YouTube (requiere yt-dlp + ffmpeg) — implementado, pero aún **experimental/sin probar de forma extensiva**
3. **Spotify**: Intenta abrir/controlar Spotify — implementado de forma parcial y **experimental**; el flujo de autenticación guarda un token, pero la reproducción real todavía no lo consume, así que puede requerir reproducir manualmente

> Ver `doc/current_status.md` para el detalle actualizado de qué está probado y qué sigue siendo experimental.

### 📊 Panel de Estadísticas (editable y en vivo)
- Tiempo total programado, sesiones completadas, rachas y logros desbloqueados
- Historial de las últimas sesiones
- La alarma (tipo/ruta/volumen) y los tiempos (trabajo/descanso/mínimo diario/estiramiento) se pueden editar directamente desde el propio panel
- Se actualiza solo cuando cambian tus datos, sin tener que cerrarlo y volver a abrirlo

## 🚀 Instalación

### Desde el código fuente:

1. Clona o descarga este repositorio
2. Abre la carpeta en VS Code
3. Instala las dependencias:
```bash
npm install
```

4. Compila el proyecto:
```bash
npm run compile
```

5. Presiona `F5` para ejecutar la extensión en modo desarrollo

### Empaquetar la extensión:

```bash
npm install -g @vscode/vsce
vsce package
```

Esto creará un archivo `.vsix` que puedes instalar manualmente en VS Code.

## 📋 Requisitos Opcionales

### Para usar YouTube como alarma:
- **yt-dlp**: [Descargar aquí](https://github.com/yt-dlp/yt-dlp)
- **ffmpeg**: [Descargar aquí](https://ffmpeg.org/download.html)

#### Instalación en diferentes sistemas:

**Windows:**
```bash
# Con Chocolatey
choco install yt-dlp ffmpeg

# Con Scoop
scoop install yt-dlp ffmpeg
```

**macOS:**
```bash
brew install yt-dlp ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install ffmpeg
sudo pip install yt-dlp
```

### Para usar Spotify:
- Tener Spotify instalado y en ejecución
- En macOS y Linux el control es automático
- En Windows se mostrará una notificación para reproducir manualmente

### Para el Panel de Reproductor:
- Solo funciona en **Windows** (usa `SendKeys` y la API SMTC de `Windows.Media.Control`)

## 🎮 Comandos Disponibles

Accede a estos comandos desde la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`):

- `🍅 Iniciar Sesión de Trabajo`: Comienza una sesión de programación
- `☕ Iniciar Descanso`: Inicia un período de descanso
- `⏹️ Detener Temporizador`: Detiene el temporizador actual
- `⏰ Establecer Límite Diario`: Define tu objetivo de programación para hoy
- `📊 Ver Estadísticas y Rachas`: Muestra tus estadísticas completas (y te permite editar tu configuración ahí mismo)
- `⚙️ Configurar Temporizador`: Configura duraciones de trabajo, descanso, mínimo diario y estiramiento
- `🔊 Configurar Sonido de Alarma`: Personaliza la alarma
- `🔊 Probar el Sonido de Alarma`: Reproduce la alarma configurada para verificarla
- `⏰ Activar Recordatorio Diario`: Registra el recordatorio diario en el Task Scheduler de Windows (pide confirmación antes de crear la tarea)
- `⏰ Desactivar Recordatorio Diario`: Elimina la tarea programada

El panel de reproductor (Windows) se accede desde su propio ícono en la Activity Bar, no requiere un comando. Desde su footer también puedes abrir el panel de Estadísticas con el botón "⚙️ Configuración".

## ⚙️ Configuración

Puedes configurar la extensión desde:
1. La paleta de comandos usando los comandos de configuración
2. El propio panel de Estadísticas (`📊 Ver Estadísticas y Rachas`)
3. Directamente en la configuración de VS Code (`settings.json`):

```json
{
  "productivityTimer.workDuration": 30,
  "productivityTimer.breakDuration": 10,
  "productivityTimer.minimumDailyMinutes": 30,
  "productivityTimer.stretchDuration": 5,
  "productivityTimer.dailyReminderTime": "20:00",
  "productivityTimer.stretchVideos": [],
  "productivityTimer.alarmType": "local",
  "productivityTimer.alarmPath": "/ruta/al/archivo.mp3",
  "productivityTimer.volume": 50
}
```

### Opciones de configuración:

- `workDuration`: Duración de la sesión de trabajo en minutos (por defecto: 30)
- `breakDuration`: Duración del descanso en minutos (por defecto: 10)
- `minimumDailyMinutes`: Minutos mínimos para mantener racha (por defecto: 30)
- `stretchDuration`: Duración de la etapa de estiramiento en minutos (por defecto: 5)
- `dailyReminderTime`: Hora (formato 24h `HH:mm`) del recordatorio diario, si está activado (por defecto: "20:00")
- `stretchVideos`: Lista de URLs de YouTube con rutinas de estiramiento; si está vacía, se usa la lista curada por defecto
- `alarmType`: Tipo de alarma - "local", "youtube" o "spotify" (por defecto: "local")
- `alarmPath`: Ruta del archivo o URL de YouTube
- `volume`: Volumen de la alarma 0-100 (por defecto: 50)

## 💡 Uso Recomendado

### Técnica Pomodoro Clásica:
1. Configura 25 minutos de trabajo y 5 minutos de descanso
2. Trabaja en sesiones enfocadas
3. Descansa durante los breaks (y aprovecha para estirar)
4. Después de 4 sesiones, toma un descanso más largo (15-30 min)

### Sesiones Personalizadas:
1. Ajusta los tiempos según tu preferencia (ej: 50/10, 30/10)
2. Usa el límite diario cuando tengas poco tiempo
3. Mantén tu racha programando todos los días

### Sistema de Puntos y Logros:

**Puntos se otorgan por:**
- 1 punto por cada minuto trabajado
- +50 puntos al completar una sesión
- +100 puntos por mantener racha diaria
- +200 puntos por racha de 7 días
- +500 puntos por racha de 30 días

**Logros disponibles:**
- 🎯 Primera Racha (1 día)
- 🌟 Semana Completa (7 días)
- 👑 Mes Completo (30 días)
- 💎 Centenario (100 días)
- 🏆 1K Puntos
- 💰 10K Puntos
- 🎪 50 Sesiones
- 🚀 100 Sesiones
- ⏰ 1000 Minutos

## 🎨 Interfaz

La extensión muestra información en la barra de estado:
- Cuando está inactiva: `$(clock) Pomodoro | 🔥[racha] | ⭐[puntos]`
- Durante el trabajo: `🍅 [tiempo] - Trabajando`
- Durante el descanso: `☕ [tiempo] - Descansando`
- Durante el estiramiento: `🧘 [tiempo] - Estirando`

Haz clic en la barra de estado para:
- Iniciar una sesión (cuando está inactivo)
- Detener el temporizador (cuando está activo)

## 🐛 Solución de Problemas

### La alarma no suena:
1. Verifica que el archivo de audio existe y es accesible
2. Para YouTube, asegúrate de tener yt-dlp y ffmpeg instalados
3. Prueba la alarma usando el comando "Configurar Sonido de Alarma" o el botón "Probar" del panel de Estadísticas

### La racha no se actualiza:
1. Verifica que has cumplido el mínimo de minutos diarios
2. Las rachas se actualizan al completar sesiones
3. Si detienes una sesión antes de tiempo, el tiempo trabajado se registra pero puede no contar para la racha

### YouTube no funciona:
1. Verifica que yt-dlp esté instalado: `yt-dlp --version`
2. Verifica que ffmpeg esté instalado: `ffmpeg -version`
3. Asegúrate de que la URL de YouTube sea válida

### El panel de reproductor no aparece o no controla nada:
1. Esta característica es exclusiva de Windows
2. Necesita que al menos una app esté usando la sesión de medios de Windows (SMTC) — prueba reproducir algo en Spotify o el navegador primero

### El recordatorio diario no muestra ninguna notificación:
1. Esta característica es exclusiva de Windows
2. Solo se dispara si a esa hora ya cumpliste el mínimo diario configurado — si ya trabajaste suficiente, es esperado que no aparezca nada
3. Solo se ejecuta si tienes sesión iniciada en Windows a la hora programada (no funciona con la sesión bloqueada o cerrada)
4. Verifica que la tarea esté registrada con `schtasks /query /tn ProductivityTimerDailyReminder`

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un bug o tienes una sugerencia:

1. Abre un issue describiendo el problema o la mejora
2. Si quieres contribuir código, haz un fork y envía un pull request
3. Revisa `doc/CONTRIBUTING.md`, `doc/TODO.md` y `doc/FEATURES.md` para ver el estado y el roadmap actual del proyecto

## 📝 Licencia

MIT License - Siéntete libre de usar y modificar esta extensión

## 👤 Autor

Creado y mantenido por **[Sebaxsus](https://github.com/Sebaxsus)**, con desarrollo asistido por Claude Code.

## 🎉 Agradecimientos

- Inspirado en la Técnica Pomodoro de Francesco Cirillo
- Emojis de OpenMoji
- Comunidad de VS Code

## 📞 Soporte

¿Necesitas ayuda? Abre un issue en el repositorio del proyecto.

---

**¡Programa con enfoque, mantén tu racha y alcanza tus metas! 🚀**


[1]: https://learn.microsoft.com/es-es/dotnet/api/system.windows.media.mediaplayer?view=windowsdesktop-8.0 "Link a la documentación de .Net sobre la Clase Media Player"
