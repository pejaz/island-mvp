import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/node/cli.ts', './src/node/index.ts', './src/node/dev.ts'],
  bundle: true,
  splitting: true,
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  shims: true,
  clean: true,
})
