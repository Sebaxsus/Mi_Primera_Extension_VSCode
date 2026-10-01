const esbuild = require("esbuild");
const fs = require("fs");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * Imprime el inicio/fin de cada build con el formato que espera el problemMatcher
 * de `.vscode/tasks.json` (`[watch] build started` / `[watch] build finished`).
 * Sin estas líneas, la tarea en background nunca se da por terminada y el
 * `preLaunchTask` de "Run Extension" se queda esperando para siempre.
 *
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',
    setup(build) {
        build.onStart(() => {
            console.log('[watch] build started');
        });
        build.onEnd((result) => {
            result.errors.forEach(({ text, location }) => {
                console.error(`✘ [ERROR] ${text}`);
                if (location) {
                    console.error(`    ${location.file}:${location.line}:${location.column}:`);
                }
            });
            // El bridge de PowerShell no se bundlea: se copia junto al JS compilado
            // en cada build (también en watch), ver MusicPlayer.initPlayer().
            fs.mkdirSync('out', { recursive: true });
            fs.copyFileSync('src/player_bridge.ps1', 'out/player_bridge.ps1');
            console.log('[watch] build finished');
        });
    },
};

async function main() {
    const ctx = await esbuild.context({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        format: 'cjs',
        platform: 'node',
        target: 'node16',
        external: ['vscode'],
        outfile: 'out/extension.js',
        sourcemap: !production,
        minify: production,
        logLevel: 'silent',
        plugins: [esbuildProblemMatcherPlugin],
    });
    if (watch) {
        await ctx.watch();
    } else {
        await ctx.rebuild();
        await ctx.dispose();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
