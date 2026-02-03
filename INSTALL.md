# 🚀 Guía de Instalación Rápida

## Opción 1: Desarrollo y Prueba

1. **Instalar dependencias:**
```bash
npm install
```

2. **Compilar el proyecto:**
```bash
npm run compile
```

3. **Ejecutar en modo desarrollo:**
   - Presiona `F5` en VS Code
   - Esto abrirá una nueva ventana de VS Code con la extensión cargada

4. **Probar la extensión:**
   - En la nueva ventana, presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
   - Busca "Productivity Timer"
   - Selecciona "Iniciar Sesión de Trabajo"

## Opción 2: Instalar como Extensión

1. **Instalar vsce (si no lo tienes):**
```bash
npm install -g @vscode/vsce
```

2. **Empaquetar la extensión:**
```bash
vsce package
```

3. **Instalar el archivo .vsix generado:**
   - En VS Code, ve a Extensions (Ctrl+Shift+X)
   - Haz clic en el menú "..." en la parte superior
   - Selecciona "Install from VSIX..."
   - Selecciona el archivo `.vsix` generado

## Configuración Inicial

### 1. Configurar tiempos de trabajo
```
Ctrl+Shift+P → "Productivity Timer: Configurar Temporizador"
```

### 2. Configurar alarma
```
Ctrl+Shift+P → "Productivity Timer: Configurar Sonido de Alarma"
```

### 3. Iniciar primera sesión
```
Ctrl+Shift+P → "Productivity Timer: Iniciar Sesión de Trabajo"
```
O haz clic en el icono del reloj en la barra de estado

## Configuración Opcional de YouTube (Recomendado)

### Windows (con Chocolatey):
```bash
choco install yt-dlp ffmpeg
```

### Windows (con Scoop):
```bash
scoop install yt-dlp ffmpeg
```

### macOS:
```bash
brew install yt-dlp ffmpeg
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
sudo pip install yt-dlp
```

### Verificar instalación:
```bash
yt-dlp --version
ffmpeg -version
```

## Primeros Pasos

1. **Ver estadísticas:**
   - Haz clic en el icono del reloj en la barra de estado
   - O ejecuta: `Ctrl+Shift+P → "Ver Estadísticas y Rachas"`

2. **Establecer un objetivo diario:**
   - `Ctrl+Shift+P → "Establecer Límite Diario"`
   - Ingresa los minutos que quieres programar hoy

3. **Personalizar configuración:**
   - Ve a: `File → Preferences → Settings`
   - Busca: "Productivity Timer"
   - Ajusta según tus preferencias

## Solución de Problemas Comunes

### La extensión no se activa:
- Cierra y vuelve a abrir VS Code
- Verifica que esté instalada: `Extensions → Busca "Productivity Timer"`

### El temporizador no aparece en la barra de estado:
- Reinicia VS Code
- Ejecuta cualquier comando de Productivity Timer desde la paleta

### La alarma no suena:
1. Verifica la configuración de audio
2. Prueba con un archivo local primero
3. Para YouTube, verifica que yt-dlp y ffmpeg estén instalados

### YouTube no funciona:
```bash
# Verifica instalación
yt-dlp --version
ffmpeg -version

# Si falta alguno, instálalo siguiendo las instrucciones arriba
```

## Comandos de Desarrollo

### Compilar automáticamente al guardar:
```bash
npm run watch
```

### Ejecutar linter:
```bash
npm run lint
```

### Limpiar archivos compilados:
```bash
rm -rf out/
```

## Siguiente Paso

¡Ya estás listo! Comienza tu primera sesión de programación enfocada:

```
Ctrl+Shift+P → "Productivity Timer: Iniciar Sesión de Trabajo"
```

¡Construye tu racha y alcanza tus metas! 🚀🔥
