# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Productivity Timer! Esta guía te ayudará a empezar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)

---

## Código de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participación en este proyecto una experiencia libre de acoso para todos.

### Comportamiento Esperado

- Usa lenguaje acogedor e inclusivo
- Respeta diferentes puntos de vista
- Acepta críticas constructivas con gracia
- Enfócate en lo mejor para la comunidad

### Comportamiento Inaceptable

- Comentarios ofensivos o discriminatorios
- Ataques personales
- Acoso público o privado
- Publicar información privada sin permiso

---

## ¿Cómo Puedo Contribuir?

### 🐛 Reportar Bugs

**Antes de reportar:**
- Verifica que el bug no haya sido reportado
- Verifica que sea un bug, no un problema de configuración
- Recopila información detallada

**Información a incluir:**
```
**Descripción del Bug:**
[Descripción clara del problema]

**Pasos para Reproducir:**
1. [Primer paso]
2. [Segundo paso]
3. [...]

**Comportamiento Esperado:**
[Qué debería pasar]

**Comportamiento Actual:**
[Qué está pasando]

**Capturas de Pantalla:**
[Si aplica]

**Entorno:**
- OS: [Windows 10, macOS 13, Ubuntu 22.04]
- VS Code: [1.85.0]
- Extensión: [1.0.0]

**Logs:**
[De Help → Toggle Developer Tools → Console]
```

### 💡 Sugerir Mejoras

**Incluye:**
- Descripción clara de la funcionalidad
- Por qué sería útil
- Cómo funcionaría
- Alternativas consideradas

### 📝 Contribuir Código

**Tipos de contribuciones bienvenidas:**
- Corrección de bugs
- Nuevas características
- Mejoras de rendimiento
- Mejoras de documentación
- Pruebas

---

## Configuración del Entorno

### Requisitos

- Node.js 18+
- npm 8+
- VS Code 1.75+
- Git

### Setup Inicial

```bash
# 1. Fork el repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/vscode-productivity-timer.git
cd vscode-productivity-timer

# 3. Agregar el repositorio original como upstream
git remote add upstream https://github.com/ORIGINAL/vscode-productivity-timer.git

# 4. Instalar dependencias
npm install

# 5. Compilar
npm run compile

# 6. Ejecutar en modo desarrollo
# Presiona F5 en VS Code
```

### Verificar Setup

```bash
# Compilar sin errores
npm run compile

# Ejecutar linter
npm run lint

# Todo debería pasar sin errores
```

---

## Estructura del Proyecto

```
vscode-productivity-timer/
├── src/                      # Código fuente TypeScript
│   ├── extension.ts          # Punto de entrada
│   ├── timer.ts              # Lógica del temporizador
│   ├── dataManager.ts        # Gestión de datos/estadísticas
│   ├── alarmManager.ts       # Sistema de alarmas
│   └── motivationalQuotes.ts # Frases motivacionales
├── out/                      # Código compilado (generado)
├── node_modules/             # Dependencias (generado)
├── .vscode/                  # Configuración de VS Code
│   ├── launch.json           # Configuración de debugging
│   └── tasks.json            # Tareas de compilación
├── package.json              # Metadata y dependencias
├── tsconfig.json             # Configuración de TypeScript
├── .eslintrc.json            # Reglas de linting
└── README.md                 # Documentación principal
```

### Archivos Clave

**extension.ts**: Activación de la extensión, registro de comandos, UI principal

**timer.ts**: Clase Timer con toda la lógica del temporizador Pomodoro

**dataManager.ts**: Gestión de estadísticas, rachas, puntos, almacenamiento

**alarmManager.ts**: Reproducción de alarmas (local, YouTube, Spotify)

**motivationalQuotes.ts**: Sistema de frases motivacionales

---

## Proceso de Desarrollo

### 1. Crear una Branch

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear branch descriptiva
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/nombre-del-bug
```

### 2. Hacer Cambios

```bash
# Editar archivos
# Compilar continuamente
npm run watch

# Probar en VS Code (F5)
```

### 3. Seguir Estándares

- Código limpio y legible
- Comentarios donde necesario
- Nombres descriptivos de variables/funciones
- Seguir patrones existentes

### 4. Probar Exhaustivamente

**Checklist:**
- ✅ La funcionalidad funciona como se espera
- ✅ No rompe funcionalidades existentes
- ✅ Probado en diferentes escenarios
- ✅ Probado en diferentes OS (si es posible)
- ✅ Sin errores en la consola
- ✅ Lint pasa sin errores

### 5. Commit

```bash
# Stage cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar soporte para alarmas con volumen variable"
```

**Formato de mensajes de commit:**
```
tipo: descripción breve

[Opcional] Descripción más detallada

[Opcional] BREAKING CHANGE: descripción
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato (no afecta código)
- `refactor`: Refactorización
- `perf`: Mejora de rendimiento
- `test`: Agregar/modificar tests
- `chore`: Tareas de mantenimiento

### 6. Push

```bash
git push origin feature/nombre-descriptivo
```

---

## Estándares de Código

### TypeScript

**Naming Conventions:**
```typescript
// Classes: PascalCase
class DataManager { }

// Interfaces: PascalCase con prefijo I (opcional)
interface IUserStats { }

// Variables/Funciones: camelCase
const currentStreak = 0;
function calculatePoints() { }

// Constants: UPPER_SNAKE_CASE
const MAX_DAILY_MINUTES = 1440;

// Private members: prefijo _
private _statusBar: StatusBar;
```

**Tipos:**
```typescript
// Usar tipos explícitos
function addSession(minutes: number): void { }

// Evitar 'any'
// ❌ const data: any = getData();
// ✅ const data: UserStats = getData();
```

**Async/Await:**
```typescript
// Preferir async/await sobre Promises
// ✅
async function saveData(): Promise<void> {
  await this.context.globalState.update(key, data);
}

// ❌
function saveData(): Promise<void> {
  return this.context.globalState.update(key, data);
}
```

### Organización del Código

**Orden en clases:**
```typescript
class Example {
  // 1. Propiedades públicas
  public name: string;
  
  // 2. Propiedades privadas
  private _data: any;
  
  // 3. Constructor
  constructor() { }
  
  // 4. Métodos públicos
  public doSomething(): void { }
  
  // 5. Métodos privados
  private helperMethod(): void { }
}
```

### Comentarios

```typescript
// Comentarios para explicar "por qué", no "qué"

// ❌ Incrementar el contador
counter++;

// ✅ Incrementar para mantener sincronización con el servidor
counter++;

/**
 * Calcula puntos basándose en minutos trabajados y racha actual
 * @param minutes Minutos trabajados en la sesión
 * @returns Puntos totales otorgados
 */
private calculatePoints(minutes: number): number { }
```

### Manejo de Errores

```typescript
// Siempre manejar errores
try {
  await this.playAlarm();
} catch (error) {
  vscode.window.showErrorMessage(`Error: ${error}`);
  this.playSystemBeep(); // Fallback
}
```

---

## Proceso de Pull Request

### 1. Antes de Enviar

**Checklist:**
- [ ] Código compila sin errores
- [ ] Lint pasa sin warnings
- [ ] Funcionalidad probada
- [ ] Documentación actualizada si es necesario
- [ ] CHANGELOG.md actualizado
- [ ] Commits tienen mensajes descriptivos

### 2. Crear PR

**En GitHub:**
1. Ve a tu fork
2. Click en "Pull Request"
3. Selecciona tu branch
4. Completa el template

**Template de PR:**
```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se probó?
[Describe cómo probaste los cambios]

## Checklist
- [ ] Código sigue los estándares del proyecto
- [ ] He comentado mi código donde necesario
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Tests nuevos y existentes pasan localmente
```

### 3. Review Process

**Qué esperar:**
- Revisión de código por mantenedores
- Posibles solicitudes de cambios
- Discusión sobre implementación
- Aprobación o rechazo con razones

**Durante la revisión:**
- Responde a comentarios prontamente
- Haz cambios solicitados
- Mantén discusión profesional
- Push de cambios actualiza el PR automáticamente

### 4. Después de Aprobación

- Tu código será merged
- Branch puede ser eliminada
- ¡Celebra tu contribución! 🎉

---

## Áreas que Necesitan Ayuda

### 🔴 Alta Prioridad

- Tests automatizados
- Soporte para más reproductores de audio
- Optimización de rendimiento
- Corrección de bugs reportados

### 🟡 Media Prioridad

- Gráficas de estadísticas
- Exportar/importar datos
- Temas personalizables
- Más frases motivacionales

### 🟢 Baja Prioridad

- Integración con servicios externos
- Modo equipos/colaborativo
- Animaciones en UI

---

## Recursos

### Documentación Útil

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

### Herramientas

- [VS Code Extension Generator](https://code.visualstudio.com/api/get-started/your-first-extension)
- [vsce - Publishing Tool](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

## Preguntas

¿Tienes preguntas? No dudes en:
- Abrir un issue con la etiqueta "question"
- Contactar a los mantenedores
- Revisar issues existentes

---

## Reconocimiento

Todos los contribuidores serán reconocidos en:
- README.md (sección de contribuidores)
- CHANGELOG.md (en el release correspondiente)

---

¡Gracias por contribuir a Productivity Timer! 🚀

Tu ayuda hace que este proyecto sea mejor para todos. 💪
