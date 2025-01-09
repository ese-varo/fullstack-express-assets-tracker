export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
}
