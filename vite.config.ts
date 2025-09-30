import { defineConfig } from 'vite';

export default defineConfig({
  base: '/lean-ui/',
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        test: './test.html'
      }
    }
  },
  optimizeDeps: {
    include: ['monaco-editor']
  }
});