# 🔊 Guía de Personalización de Alarmas

## Para Windows se usa Media de PresentationCore de .Net

[Mas Info](https://learn.microsoft.com/es-es/dotnet/api/system.windows.media.mediaplayer?view=windowsdesktop-8.0)

## Sonidos Recomendados

### 1. Sonidos Relajantes (Ideal para Descansos)

**Campanas Tibetanas:**
- Búsqueda en YouTube: "tibetan singing bowl 5 seconds"
- Efecto: Calma y relajación

**Sonidos de la Naturaleza:**
- Búsqueda en YouTube: "gentle chime sound effect"
- Efecto: Suave y no intrusivo

**Piano Suave:**
- Búsqueda en YouTube: "gentle piano notification"
- Efecto: Elegante y tranquilo

### 2. Sonidos Energizantes (Ideal para Volver al Trabajo)

**Campanas Alegres:**
- Búsqueda en YouTube: "happy bell sound effect"
- Efecto: Motivador sin ser agresivo

**Arpegios Ascendentes:**
- Búsqueda en YouTube: "uplifting notification sound"
- Efecto: Energético y positivo

**Tonos Electrónicos:**
- Búsqueda en YouTube: "modern notification sound"
- Efecto: Limpio y claro

### 3. Alarmas Divertidas

**Sonidos de Videojuegos:**
- Búsqueda en YouTube: "retro game power up sound"
- Búsqueda en YouTube: "mario coin sound effect"
- Efecto: Nostálgico y motivador

**Efectos de Celebración:**
- Búsqueda en YouTube: "success sound effect"
- Búsqueda en YouTube: "achievement unlock sound"
- Efecto: Recompensa psicológica

---

## Cómo Descargar Sonidos desde YouTube

### Opción 1: Usar yt-dlp (Recomendado)

```bash
# Descargar solo audio en formato MP3
yt-dlp -x --audio-format mp3 -o "alarm.mp3" "URL_DE_YOUTUBE"

# Ejemplo:
yt-dlp -x --audio-format mp3 -o "alarm.mp3" "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Descargar y recortar a los primeros 5 segundos (requiere ffmpeg)
yt-dlp -x --audio-format mp3 --postprocessor-args "-ss 00:00:00 -t 00:00:05" -o "alarm.mp3" "URL_DE_YOUTUBE"
```

### Opción 2: Sitios de Descarga

**Sitios Confiables:**
- youtube-to-mp3.org
- ytmp3.cc
- y2mate.com

**Proceso:**
1. Copia la URL del video de YouTube
2. Pégala en el sitio
3. Selecciona formato MP3
4. Descarga el archivo
5. Recorta si es necesario (ver sección de edición)

---

## Edición de Archivos de Audio

### Usando Audacity (Gratis y Multi-plataforma)

**Instalación:**
```bash
# Windows (con Chocolatey)
choco install audacity

# macOS
brew install --cask audacity

# Linux (Ubuntu/Debian)
sudo apt install audacity
```

**Recortar Audio a 3-5 Segundos:**
1. Abre el archivo en Audacity
2. Selecciona la parte que quieres (primeros 3-5 segundos)
3. Presiona `Ctrl+T` para recortar
4. File → Export → Export as MP3
5. Guarda el archivo

**Ajustar Volumen:**
1. Selecciona todo (`Ctrl+A`)
2. Effect → Amplify
3. Ajusta el nivel
4. OK

**Agregar Fade In/Out:**
1. Selecciona el inicio (fade in) o final (fade out)
2. Effect → Fade In (o Fade Out)
3. Apply

### Usando FFmpeg (Línea de Comandos)

**Recortar a 5 segundos:**
```bash
ffmpeg -i entrada.mp3 -ss 00:00:00 -t 00:00:05 -acodec copy salida.mp3
```

**Ajustar volumen (+6dB):**
```bash
ffmpeg -i entrada.mp3 -filter:a "volume=1.5" salida.mp3
```

**Fade in (2 segundos):**
```bash
ffmpeg -i entrada.mp3 -filter:a "afade=t=in:st=0:d=2" salida.mp3
```

**Fade out (2 segundos):**
```bash
ffmpeg -i entrada.mp3 -filter:a "afade=t=out:st=3:d=2" salida.mp3
```

**Combinar: recortar, normalizar y fade:**
```bash
ffmpeg -i entrada.mp3 -ss 00:00:00 -t 00:00:05 -filter:a "volume=1.5,afade=t=in:st=0:d=1,afade=t=out:st=4:d=1" alarm.mp3
```

---

## Crear Tus Propios Sonidos

### Usando Sintetizadores Online

**Tone.js (JavaScript en el navegador):**
```javascript
// Crear un tono simple
const synth = new Tone.Synth().toDestination();
synth.triggerAttackRelease("C4", "8n");

// Crear una secuencia
const seq = new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, "8n", time);
}, ["C4", "E4", "G4", "C5"]);
```

**Soundation (Online DAW Gratis):**
1. Ve a soundation.com
2. Crea cuenta gratis
3. Usa los sintetizadores virtuales
4. Exporta como MP3

### Grabaciones Personalizadas

**Usando tu Teléfono:**
1. Graba un sonido corto (campana, palmas, etc.)
2. Transfiérelo a tu computadora
3. Edita según necesites
4. Configúralo como alarma

**Ideas Creativas:**
- Grabar tu propia voz diciendo "¡Tiempo!"
- Golpear copas con agua (tono cristalino)
- Tocar un instrumento musical
- Sonidos de objetos cotidianos

---

## Listas de Reproducción de Spotify para Alarmas

### Crear Lista de Reproducción de Una Canción

1. Crea una lista en Spotify con una sola canción energizante
2. Obtén el URI de la lista
3. Configúralo en la extensión:

```json
{
  "productivityTimer.alarmType": "spotify",
  "productivityTimer.alarmPath": "spotify:playlist:TU_PLAYLIST_ID"
}
```

### Canciones Recomendadas para Alarmas

**Energizantes:**
- Eye of the Tiger - Survivor
- Don't Stop Me Now - Queen
- Happy - Pharrell Williams
- Uptown Funk - Bruno Mars

**Motivacionales:**
- Hall of Fame - The Script
- Stronger - Kanye West
- Lose Yourself - Eminem
- Can't Hold Us - Macklemore

**Relajantes:**
- Weightless - Marconi Union
- Clair de Lune - Debussy
- Gymnopédie No.1 - Erik Satie

---

## Sonidos de Alarma Gratis Online

### Sitios de Efectos de Sonido Gratis

**FreeSound.org:**
- Miles de efectos de sonido gratuitos
- Licencias Creative Commons
- Búsqueda: "notification", "bell", "chime"

**Zapsplat.com:**
- Efectos de sonido profesionales gratis
- Cuenta gratuita requerida
- Calidad alta

**SoundBible.com:**
- Librería de sonidos gratis
- Formato MP3 y WAV
- Búsqueda fácil

### Packs de Sonidos Recomendados

**Pack de Notificaciones Suaves:**
1. Descarga varios sonidos de campanas
2. Prueba cada uno durante una semana
3. Encuentra tu favorito
4. Alterna entre ellos para no cansarte

---

## Configuraciones Avanzadas

### Alarma Diferente para Trabajo vs. Descanso

**Opción 1: Cambiar Manualmente**

Antes de iniciar trabajo:
```json
{
  "productivityTimer.alarmPath": "/ruta/al/energizante.mp3"
}
```

Antes de iniciar descanso:
```json
{
  "productivityTimer.alarmPath": "/ruta/al/relajante.mp3"
}
```

**Opción 2: Crear Scripts**

Crea dos archivos de configuración y cambia entre ellos según necesites.

### Alarma Aleatoria

**Usando un Script (bash/PowerShell):**

```bash
#!/bin/bash
# Linux/macOS
SOUNDS_DIR="/ruta/a/sonidos"
RANDOM_SOUND=$(ls $SOUNDS_DIR/*.mp3 | shuf -n 1)
echo "Usando: $RANDOM_SOUND"

# Actualizar configuración de VS Code
code --user-data-dir ~/.config/Code/User/settings.json
```

---

## Solución de Problemas de Audio

### El sonido es muy bajo
```bash
# Aumentar volumen del archivo
ffmpeg -i entrada.mp3 -filter:a "volume=2.0" salida.mp3
```

### El sonido es muy fuerte
```bash
# Reducir volumen del archivo
ffmpeg -i entrada.mp3 -filter:a "volume=0.5" salida.mp3
```

### El sonido suena distorsionado
```bash
# Normalizar audio
ffmpeg -i entrada.mp3 -filter:a "loudnorm" salida.mp3
```

### El archivo es muy grande
```bash
# Comprimir con menor bitrate
ffmpeg -i entrada.mp3 -b:a 128k salida.mp3
```

---

## Recomendaciones Finales

1. **Duración Ideal:** 2-5 segundos
2. **Formato:** MP3 (mejor compatibilidad)
3. **Volumen:** Ni muy bajo ni muy alto (prueba primero)
4. **Variedad:** Ten varios sonidos y rótalos
5. **Contexto:** Considera tu entorno de trabajo

¡Encuentra el sonido perfecto que te motive sin molestarte! 🎵
