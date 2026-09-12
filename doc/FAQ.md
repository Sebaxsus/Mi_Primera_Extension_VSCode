# ❓ Preguntas Frecuentes (FAQ)

## General

### ¿Qué es Productivity Timer?

Es una extensión de VS Code que combina la técnica Pomodoro con gamificación (rachas y puntos) para ayudarte a mantener el enfoque mientras programas.

### ¿Es gratis?

Sí, completamente gratis y de código abierto bajo licencia MIT.

### ¿Funciona en todas las versiones de VS Code?

Sí, funciona en VS Code 1.75.0 o superior en Windows, macOS y Linux.

---

## Configuración

### ¿Cómo cambio la duración de las sesiones?

**Opción 1: Comando**
```
Ctrl+Shift+P → "Productivity Timer: Configurar Temporizador"
```

**Opción 2: Settings**
```json
{
  "productivityTimer.workDuration": 30,
  "productivityTimer.breakDuration": 10
}
```

### ¿Puedo tener diferentes duraciones para diferentes proyectos?

Sí, puedes configurar ajustes a nivel de workspace (proyecto) en lugar de global:
1. Ve a Settings
2. Busca "Productivity Timer"
3. Cambia de "User" a "Workspace"
4. Configura los valores

### ¿Cómo desactivo temporalmente la extensión?

**Opción 1: Deshabilitar**
- Ve a Extensions (Ctrl+Shift+X)
- Busca "Productivity Timer"
- Click en el ícono de engranaje → "Disable"

**Opción 2: Simplemente no usar**
- No necesitas desactivarla, simplemente no inicies sesiones

---

## Rachas y Puntos

### ¿Cómo funciona el sistema de rachas?

Una racha cuenta los días consecutivos que programas cumpliendo el mínimo diario configurado (por defecto 30 minutos).

### Perdí mi racha por un día, ¿puedo recuperarla?

No, las rachas se reinician cuando pasas un día sin cumplir el mínimo. Esto es intencional para motivar consistencia.

### ¿Cómo se calculan los puntos?

**Puntos base:**
- 1 punto por minuto trabajado
- +50 puntos por sesión completada

**Bonificaciones:**
- +100 puntos por mantener racha diaria
- +200 puntos por racha de 7 días
- +500 puntos por racha de 30 días

### ¿Para qué sirven los puntos?

Los puntos son un sistema de gamificación para motivarte. Puedes:
- Competir contigo mismo
- Establecer metas semanales/mensuales
- Desbloquear logros
- Medir tu progreso a largo plazo

### ¿Se pueden reiniciar las estadísticas?

Actualmente no hay comando directo, pero puedes limpiar los datos desde:
- Settings → Application → Storage → Clear Workspace Storage

**⚠️ Advertencia:** Esto eliminará todas tus estadísticas permanentemente.

---

## Temporizador

### ¿Puedo pausar una sesión?

No hay función de pausa. Puedes detener el temporizador y el tiempo trabajado se registrará.

### ¿Qué pasa si cierro VS Code durante una sesión?

La sesión se detendrá y el tiempo trabajado hasta ese momento se guardará.

### ¿Puedo tener sesiones de diferentes duraciones?

Los tiempos se configuran globalmente, pero puedes cambiarlos antes de cada sesión si lo deseas.

### El temporizador no aparece en la barra de estado

**Soluciones:**
1. Reinicia VS Code
2. Ejecuta cualquier comando de Productivity Timer
3. Verifica que la extensión esté habilitada
4. Revisa la consola (Help → Toggle Developer Tools)

---

## Alarmas

### La alarma no suena, ¿qué hago?

**Verificaciones:**
1. ¿El archivo de audio existe en la ruta configurada?
2. ¿Es un formato soportado (.mp3, .wav, .ogg)?
3. ¿El volumen está configurado arriba de 0?
4. ¿Tu sistema operativo tiene el volumen activado?

**Probar:**
```
Ctrl+Shift+P → "Configurar Sonido de Alarma" → Probar alarma
```

### ¿Por qué YouTube no funciona?

**Requisitos:**
- yt-dlp instalado
- ffmpeg instalado

**Verificar instalación:**
```bash
yt-dlp --version
ffmpeg -version
```

Si falta alguno, instálalo siguiendo las instrucciones en INSTALL.md

### ¿Puedo usar URLs de YouTube Music?

Sí, yt-dlp soporta YouTube Music. Solo copia la URL completa.

### ¿Spotify funciona en todos los sistemas operativos?

- **macOS**: ✅ Control automático via AppleScript
- **Linux**: ✅ Control automático via dbus (si está disponible)
- **Windows**: ⚠️ Requiere control manual o configuración adicional

### ¿Puedo usar Apple Music en lugar de Spotify?

Actualmente solo se soporta Spotify. Para otras apps, usa archivos locales.

---

## Privacidad y Datos

### ¿Dónde se guardan mis datos?

Todos los datos se guardan localmente en el storage de VS Code. Nunca se envían a servidores externos.

### ¿Puedo sincronizar mis datos entre computadoras?

No automáticamente, pero puedes:
1. Exportar el workspace storage de VS Code
2. Copiarlo a otra computadora
3. Importarlo allí

### ¿La extensión recopila estadísticas de uso?

No. La extensión no envía ningún dato a servidores externos. Todo permanece en tu computadora.

---

## Rendimiento

### ¿La extensión ralentiza VS Code?

No. La extensión es muy ligera y usa recursos mínimos:
- Actualización del timer cada segundo (trivial)
- No hay procesos en background pesados
- Solo usa almacenamiento local

### ¿Consume mucha batería en laptops?

No. El consumo es insignificante comparado con VS Code mismo.

---

## Compatibilidad

### ¿Funciona con VSCodium?

Sí, debería funcionar sin problemas en VSCodium.

### ¿Funciona con VS Code en el navegador (github.dev)?

Limitado. Algunas funciones como las alarmas de audio pueden no funcionar debido a restricciones del navegador.

### ¿Es compatible con otras extensiones?

Sí, Productivity Timer no debería tener conflictos con otras extensiones.

---

## Técnica Pomodoro

### ¿Qué es la técnica Pomodoro?

Es una técnica de gestión del tiempo que usa intervalos de trabajo (tradicionalmente 25 minutos) separados por descansos cortos (5 minutos).

**Beneficios:**
- Mejora el enfoque
- Previene el burnout
- Aumenta la productividad
- Hace el trabajo más manejable

### ¿Tengo que usar 25/5 minutos?

No. Personaliza los tiempos según tus necesidades. Algunas personas prefieren:
- 50/10 para trabajo profundo
- 15/5 para tareas variadas
- 30/10 como balance

### ¿Debo tomar el descanso obligatoriamente?

Es recomendado para:
- Descansar la vista
- Estirar el cuerpo
- Despejar la mente
- Prevenir fatiga

Pero si prefieres no tomar descansos, simplemente no inicies la sesión de descanso.

---

## Problemas Comunes

### Error: "Cannot find module..."

**Solución:**
```bash
rm -rf node_modules
npm install
npm run compile
```

### El temporizador se detiene solo

Verifica que VS Code no esté entrando en modo de suspensión o que tu computadora no esté hibernando.

### Las estadísticas no se actualizan

**Solución:**
1. Reinicia VS Code
2. Ejecuta "Ver Estadísticas"
3. Si persiste, revisa la consola de desarrollador

### No puedo instalar el .vsix

**Verificar:**
- ¿Tienes permisos de administrador?
- ¿El archivo .vsix está completo (no corrupto)?
- ¿Tu versión de VS Code es compatible (1.75+)?

---

## Solicitudes de Funciones

### ¿Puedo sugerir nuevas características?

Sí, abre un issue en el repositorio del proyecto describiendo la funcionalidad deseada.

### ¿Puedo contribuir al código?

¡Absolutamente! Fork el repositorio, haz tus cambios y envía un pull request.

### Funcionalidades planificadas para el futuro

- Exportar/importar estadísticas
- Gráficas de progreso
- Integración con calendarios
- Temas visuales personalizables
- Soporte para equipos/grupos

---

## Soporte

### ¿Dónde obtengo ayuda?

1. Revisa esta FAQ
2. Lee el README.md
3. Consulta EXAMPLES.md
4. Abre un issue en GitHub

### ¿Cómo reporto un bug?

Abre un issue en GitHub incluyendo:
- Descripción del problema
- Pasos para reproducirlo
- Sistema operativo
- Versión de VS Code
- Logs de la consola (Help → Toggle Developer Tools)

### ¿Hay un canal de chat o comunidad?

Actualmente no, pero puedes usar los GitHub Discussions para conversar con otros usuarios.

---

## Miscelánea

### ¿Por qué elegiste estos emojis?

- 🍅 = Tomate (Pomodoro en italiano)
- 🔥 = Racha encendida
- ⭐ = Puntos brillantes
- ☕ = Descanso relajante

### ¿Puedo cambiar los emojis?

Actualmente no, pero es una sugerencia interesante para futuras versiones.

### ¿La extensión funcionará siempre?

Mientras VS Code mantenga su API actual, sí. Si VS Code cambia significativamente, actualizaremos la extensión.

---

¿No encontraste tu pregunta? Abre un issue en GitHub o contribuye a este FAQ. 🚀
