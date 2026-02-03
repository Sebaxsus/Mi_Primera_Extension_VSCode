# 🍅 Productivity Timer - Pomodoro & Motivación

Una extensión completa de Visual Studio Code que te ayuda a mantener el enfoque, construir rachas de programación y mantenerte motivado con un sistema de gamificación.

## ✨ Características

### 🎯 Temporizador Pomodoro Personalizable
- **Sesiones de trabajo**: Define cuánto tiempo quieres programar (por defecto 30 minutos)
- **Descansos**: Establece períodos de descanso (por defecto 10 minutos)
- **Límite diario**: Establece un objetivo de programación para el día
- **Notificaciones**: Recibe alertas cuando termine cada sesión

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
Elige cómo quieres ser notificado al terminar cada sesión:

1. **Archivo Local**: Usa cualquier archivo de audio (.mp3, .wav, .ogg, etc.)
2. **YouTube**: Reproduce música o sonidos desde YouTube (requiere yt-dlp + ffmpeg)
3. **Spotify**: Controla Spotify para reproducir tu música favorita

### 📊 Estadísticas Detalladas
- Tiempo total programado
- Número de sesiones completadas
- Rachas actuales y récords
- Historial de sesiones
- Logros desbloqueados

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

## 🎮 Comandos Disponibles

Accede a estos comandos desde la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`):

- `🍅 Iniciar Sesión de Trabajo`: Comienza una sesión de programación
- `☕ Iniciar Descanso`: Inicia un período de descanso
- `⏹️ Detener Temporizador`: Detiene el temporizador actual
- `⏰ Establecer Límite Diario`: Define tu objetivo de programación para hoy
- `📊 Ver Estadísticas y Rachas`: Muestra tus estadísticas completas
- `⚙️ Configurar Temporizador`: Configura duraciones de trabajo y descanso
- `🔊 Configurar Sonido de Alarma`: Personaliza la alarma

## ⚙️ Configuración

Puedes configurar la extensión desde:
1. La paleta de comandos usando los comandos de configuración
2. Directamente en la configuración de VS Code (`settings.json`):

```json
{
  "productivityTimer.workDuration": 30,
  "productivityTimer.breakDuration": 10,
  "productivityTimer.minimumDailyMinutes": 30,
  "productivityTimer.alarmType": "local",
  "productivityTimer.alarmPath": "/ruta/al/archivo.mp3",
  "productivityTimer.volume": 50
}
```

### Opciones de configuración:

- `workDuration`: Duración de la sesión de trabajo en minutos (por defecto: 30)
- `breakDuration`: Duración del descanso en minutos (por defecto: 10)
- `minimumDailyMinutes`: Minutos mínimos para mantener racha (por defecto: 30)
- `alarmType`: Tipo de alarma - "local", "youtube" o "spotify" (por defecto: "local")
- `alarmPath`: Ruta del archivo o URL de YouTube
- `volume`: Volumen de la alarma 0-100 (por defecto: 50)

## 💡 Uso Recomendado

### Técnica Pomodoro Clásica:
1. Configura 25 minutos de trabajo y 5 minutos de descanso
2. Trabaja en sesiones enfocadas
3. Descansa durante los breaks
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

Haz clic en la barra de estado para:
- Iniciar una sesión (cuando está inactivo)
- Detener el temporizador (cuando está activo)

## 🐛 Solución de Problemas

### La alarma no suena:
1. Verifica que el archivo de audio existe y es accesible
2. Para YouTube, asegúrate de tener yt-dlp y ffmpeg instalados
3. Prueba la alarma usando el comando "Configurar Sonido de Alarma"

### La racha no se actualiza:
1. Verifica que has cumplido el mínimo de minutos diarios
2. Las rachas se actualizan al completar sesiones
3. Si detienes una sesión antes de tiempo, el tiempo trabajado se registra pero puede no contar para la racha

### YouTube no funciona:
1. Verifica que yt-dlp esté instalado: `yt-dlp --version`
2. Verifica que ffmpeg esté instalado: `ffmpeg -version`
3. Asegúrate de que la URL de YouTube sea válida

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un bug o tienes una sugerencia:

1. Abre un issue describiendo el problema o la mejora
2. Si quieres contribuir código, haz un fork y envía un pull request

## 📝 Licencia

MIT License - Siéntete libre de usar y modificar esta extensión

## 🎉 Agradecimientos

- Inspirado en la Técnica Pomodoro de Francesco Cirillo
- Emojis de OpenMoji
- Comunidad de VS Code

## 📞 Soporte

¿Necesitas ayuda? Abre un issue en el repositorio del proyecto.

---

**¡Programa con enfoque, mantén tu racha y alcanza tus metas! 🚀**
