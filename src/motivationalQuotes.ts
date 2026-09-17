export class MotivationalQuotes {
    private quotes: string[] = [
        "💪 ¡Cada línea de código es un paso hacia tu meta!",
        "🚀 El código de hoy es la innovación de mañana",
        "⭐ No cuentes los días, haz que los días cuenten programando",
        "🎯 La consistencia es la clave del éxito en programación",
        "🔥 Tu racha de programación demuestra tu dedicación",
        "💡 Grandes proyectos comienzan con pequeños commits",
        "🌟 Cada bug resuelto te hace más fuerte",
        "🎓 Aprender a programar es aprender a pensar",
        "⚡ El mejor momento para programar es ahora",
        "🏆 La práctica constante te llevará a la maestría",
        "🌈 Convierte tu código en arte",
        "📈 Pequeños progresos diarios = Grandes resultados",
        "🎨 Programar es crear soluciones, sigue creando",
        "🔑 La persistencia es la clave del programador exitoso",
        "💻 Hoy es un gran día para escribir código increíble",
        "🌍 Tu código puede cambiar el mundo",
        "⚙️ Optimiza tu código, optimiza tu vida",
        "🎪 Disfruta el proceso, no solo el resultado",
        "🌱 Crece un poco más como programador cada día",
        "🎯 Mantén el enfoque, mantén la racha",
        "🔮 El futuro se programa hoy",
        "🎭 Sé el protagonista de tu historia de código",
        "🏃 No pares, estás mejorando cada día",
        "🎸 Encuentra tu ritmo en el código",
        "🌺 La belleza está en el código bien escrito",
        "🎁 Cada sesión de código es un regalo para tu futuro",
        "🌞 Que tu código brille como el sol",
        "🦸 Eres el superhéroe de tu propia historia de desarrollo",
        "🎯 Enfócate en el progreso, no en la perfección",
        "🌊 Fluye con el código, deja que te guíe",
        "🎪 Haz que programar sea divertido",
        "🔥 Enciende tu pasión por el código",
        "🎨 Pinta tu futuro con líneas de código",
        "🚀 Despega hacia nuevos conocimientos",
        "⭐ Brilla con cada función que escribas",
        "🌟 Tu potencial como programador es ilimitado",
        "💎 Cada día de código te hace más valioso",
        "🎓 El conocimiento que ganas hoy es tuyo para siempre",
        "🔧 Construye tus sueños con código",
        "🎯 Mantén tu racha, alcanza tus metas",
        "🐛 Cada error es una pista, no un obstáculo",
        "🧠 Resolver problemas es tu superpoder, sigue entrenándolo",
        "🛠️ Refactorizar hoy es programar más rápido mañana",
        "📚 Leer código ajeno también es aprender a programar",
        "🌙 Aunque sea de noche, cada commit cuenta",
        "☀️ Empieza el día con una función bien escrita",
        "🧩 Cada proyecto es un rompecabezas que sabes armar",
        "🐢 Ir lento pero constante también es progreso real",
        "🌳 Los buenos hábitos de hoy son el código limpio de mañana",
        "🧪 Cada test que escribes protege tu yo del futuro",
        "🎯 No necesitas ser perfecto, solo constante",
        "🧭 Tu curiosidad es la mejor brújula para aprender",
        "🤝 Ayudar a otro programador también te hace crecer",
        "🌤️ Después de cada bug difícil llega la claridad",
        "🚧 Estás construyendo algo, aunque hoy avances poco",
        "🕰️ Cinco minutos de código valen más que cero",
        "🧘 Descansar también es parte de programar bien",
        "🌌 Cada proyecto empieza con una sola línea",
        "🔍 La atención al detalle te distingue como programador",
        "🎉 Celebra cada pequeño avance, no solo el resultado final"
    ];

    private usedIndices: Set<number> = new Set();
    private currentIndex: number = -1;

    getRandomQuote(): string {
        // Si ya usamos todas las frases, reiniciamos
        if (this.usedIndices.size === this.quotes.length) {
            this.usedIndices.clear();
        }

        let randomIndex: number;
        do {
            randomIndex = Math.floor(Math.random() * this.quotes.length);
        } while (this.usedIndices.has(randomIndex));

        this.usedIndices.add(randomIndex);
        this.currentIndex = randomIndex;
        return this.quotes[randomIndex];
    }

    getDailyQuote(dateString: string): string {
        // Generar un índice basado en la fecha para que sea consistente durante el día
        const hash = this.hashString(dateString);
        const index = hash % this.quotes.length;
        return this.quotes[index];
    }

    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    getCurrentQuote(): string {
        if (this.currentIndex === -1) {
            return this.getRandomQuote();
        }
        return this.quotes[this.currentIndex];
    }
}
