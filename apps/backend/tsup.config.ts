import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // the shared package ships TypeScript source, so it is bundled into the server
  noExternal: ['@club-portal/shared'],
});
