# 📚 Ejemplos de Uso

## Escenarios Comunes

### 1. Estudiante de Programación

**Objetivo**: Programar al menos 2 horas diarias manteniendo el enfoque

**Configuración recomendada:**
```json
{
  "productivityTimer.workDuration": 30,
  "productivityTimer.breakDuration": 10,
  "productivityTimer.minimumDailyMinutes": 120
}
```

**Rutina diaria:**
1. Al abrir VS Code, ver la frase motivacional del día
2. Iniciar sesión de trabajo de 30 minutos
3. Tomar descanso de 10 minutos
4. Repetir 4 veces para completar las 2 horas
5. Ver estadísticas y celebrar mantener la racha

---

### 2. Desarrollador Profesional

**Objetivo**: Mantener sesiones largas de trabajo profundo

**Configuración recomendada:**
```json
{
  "productivityTimer.workDuration": 50,
  "productivityTimer.breakDuration": 10,
  "productivityTimer.minimumDailyMinutes": 180
}
```

**Rutina diaria:**
1. Por la mañana: 2 sesiones de 50 minutos
2. Por la tarde: 2 sesiones de 50 minutos
3. Total: ~3 horas de trabajo enfocado + descansos
4. Acumular puntos y mantener racha

---

### 3. Principiante que Construye el Hábito

**Objetivo**: Empezar con poco y ser consistente

**Configuración recomendada:**
```json
{
  "productivityTimer.workDuration": 15,
  "productivityTimer.breakDuration": 5,
  "productivityTimer.minimumDailyMinutes": 30
}
```

**Rutina diaria:**
1. Establecer límite diario de 30 minutos al abrir VS Code
2. Trabajar en 2 sesiones de 15 minutos
3. Enfocarse en mantener la racha día a día
4. Aumentar gradualmente el mínimo diario

---

### 4. Freelancer con Horarios Flexibles

**Objetivo**: Rastrear tiempo de trabajo y mantener productividad

**Configuración recomendada:**
```json
{
  "productivityTimer.workDuration": 45,
  "productivityTimer.breakDuration": 15,
  "productivityTimer.minimumDailyMinutes": 240
}
```

**Rutina diaria:**
1. No establecer límite diario (trabajar según disponibilidad)
2. Usar sesiones de 45 minutos a lo largo del día
3. Ver estadísticas al final para validar 4+ horas trabajadas
4. Mantener racha mínima de 4 horas

---

## Configuraciones de Alarma

### Alarma con Archivo Local Relajante

```json
{
  "productivityTimer.alarmType": "local",
  "productivityTimer.alarmPath": "/Users/tuusuario/Music/campana-tibetana.mp3",
  "productivityTimer.volume": 40
}
```

### Alarma con YouTube Energizante

```json
{
  "productivityTimer.alarmType": "youtube",
  "productivityTimer.alarmPath": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "productivityTimer.volume": 60
}
```

**Nota**: yt-dlp se descarga y verifica automáticamente la primera vez que se usa (con tu confirmación). En Windows funciona sin instalar nada más; en macOS/Linux además necesitas ffmpeg instalado.

### Alarma con Spotify

```json
{
  "productivityTimer.alarmType": "spotify",
  "productivityTimer.alarmPath": "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp",
  "productivityTimer.volume": 50
}
```

**Nota**: Requiere Spotify instalado y abierto

---

## Estrategias para Maximizar Puntos

### 🏆 Estrategia de Racha Diaria

- Programa **todos los días** aunque sea el mínimo
- Bonificación: +100 puntos por mantener racha
- Bonificación extra: +200 puntos por racha de 7 días
- Mega bonificación: +500 puntos por racha de 30 días

**Ejemplo:**
- Día 1: 30 min = 30 + 50 (sesión) = 80 puntos
- Día 2: 30 min = 30 + 50 + 100 (racha) = 180 puntos
- Día 7: 30 min = 30 + 50 + 100 + 200 (semana) = 380 puntos

### ⚡ Estrategia de Sesiones Múltiples

- Completa múltiples sesiones en un día
- Bonificación: +50 puntos por cada sesión

**Ejemplo en un día:**
- Sesión 1: 30 min = 30 + 50 = 80 puntos
- Sesión 2: 30 min = 30 + 50 + 100 (racha día 2) = 180 puntos
- Sesión 3: 30 min = 30 + 50 = 80 puntos
- **Total del día: 340 puntos**

### 🎯 Estrategia de Sesiones Largas

- Trabaja en sesiones más largas
- Más minutos = más puntos base

**Ejemplo:**
- Sesión 60 min = 60 + 50 (sesión) + 100 (racha) = 210 puntos
- vs.
- Sesión 30 min = 30 + 50 (sesión) + 100 (racha) = 180 puntos

---

## Uso de Límite Diario

### Día con Poco Tiempo

```
Comando: "Establecer Límite Diario"
Entrada: 30 minutos
```

La extensión te avisará cuando hayas alcanzado tu objetivo mínimo del día.

### Día Productivo con Objetivos Altos

```
Comando: "Establecer Límite Diario"
Entrada: 180 minutos (3 horas)
```

El temporizador correrá hasta que completes 3 horas (restando lo que ya hayas trabajado hoy).

---

## Visualización de Progreso

### Ver Estadísticas

```
Ctrl+Shift+P → "Ver Estadísticas y Rachas"
```

Te muestra:
- 🔥 Racha actual y récord
- ⭐ Puntos totales
- ⏱️ Tiempo total programado
- 📅 Minutos trabajados hoy
- 🍅 Sesiones completadas
- 🏅 Logros desbloqueados
- 📊 Historial de sesiones

### Barra de Estado

Observa la barra de estado en VS Code:
- Inactivo: `$(clock) Pomodoro | 🔥7 | ⭐3450`
- Trabajando: `🍅 25:30 - Trabajando`
- Descansando: `☕ 09:45 - Descansando`

---

## Tips Avanzados

### 1. Combinar con Música de Fondo

Reproduce música de fondo mientras trabajas y usa la alarma de Spotify para cambiar a una canción específica cuando termine la sesión.

### 2. Integrar con Tu Flujo de Trabajo

- Inicia sesión antes de empezar una nueva tarea
- Usa los descansos para revisar emails o slack
- Aprovecha las estadísticas para reportar horas trabajadas

### 3. Ajustar Según Energía

- Por la mañana (alta energía): sesiones de 50 min
- Por la tarde (energía media): sesiones de 30 min
- Por la noche (baja energía): sesiones de 15 min

### 4. Gamificación Personal

- Establece metas semanales de puntos
- Compite contigo mismo para superar tu récord de racha
- Celebra cuando desbloquees nuevos logros

---

## Resolución de Escenarios Específicos

### "Quiero programar solo 30 minutos hoy pero mantener mi racha"

1. `Establecer Límite Diario` → 30 minutos
2. Completa la sesión
3. Tu racha se mantiene si el mínimo diario es ≤ 30 min

### "Olvidé programar ayer, ¿perdí mi racha?"

Sí, la racha se reinicia a 1 cuando pasas un día sin cumplir el mínimo. ¡Pero no te desanimes! Comienza una nueva racha hoy.

### "¿Puedo pausar una sesión?"

No hay función de pausa, pero puedes detener el temporizador. El tiempo trabajado hasta ese momento se registrará.

### "Quiero silenciar la alarma temporalmente"

Configura el volumen en 0:
```json
{
  "productivityTimer.volume": 0
}
```

---

¡Experimenta con diferentes configuraciones y encuentra lo que mejor funcione para ti! 🚀
