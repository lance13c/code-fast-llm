import * as esbuild from 'esbuild';

esbuild
  .build({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.cjs', // Use .cjs extension for CommonJS modules
    platform: 'node',
    target: 'es2022',
    external: ['vscode'], // Mark 'vscode' as external
    format: 'cjs', // Output format as CommonJS
  })
  .catch(() => process.exit(1));
