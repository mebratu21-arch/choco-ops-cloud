import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '')

  const isProduction = mode === 'production'

  return {
    plugins: [react()],

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Development server configuration
    server: {
      port: 5173,
      host: true,
      // Proxy API requests to backend during development
      proxy: {
        '/api': {
          target: env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: env.VITE_WS_URL || 'http://localhost:5003',
          changeOrigin: true,
          ws: true,
        },
      },
    },

    // Production build configuration
    build: {
      outDir: 'dist',
      // Enable source maps only for development builds
      sourcemap: !isProduction,
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Use terser for production minification
      minify: isProduction ? 'terser' : 'esbuild',
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,      // Remove console.log in production
          drop_debugger: true,     // Remove debugger statements
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: {
          safari10: true,          // Safari 10 compatibility
        },
        format: {
          comments: false,         // Remove comments
        },
      } : undefined,
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React libraries
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Data fetching and state management
            'data-vendor': ['@tanstack/react-query', 'axios', 'zustand'],
            // UI libraries
            'ui-vendor': ['framer-motion', 'lucide-react'],
            // Charting libraries (loaded on demand)
            'chart-vendor': ['recharts', 'chart.js', 'react-chartjs-2'],
            // Form handling
            'form-vendor': ['react-hook-form'],
            // Markdown and code highlighting
            'markdown-vendor': ['react-markdown', 'react-syntax-highlighter', 'remark-gfm'],
          },
          // Optimize chunk file naming for caching
          chunkFileNames: isProduction
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          entryFileNames: isProduction
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          assetFileNames: isProduction
            ? 'assets/[ext]/[name]-[hash].[ext]'
            : 'assets/[ext]/[name].[ext]',
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // CSS code splitting
      cssCodeSplit: true,
      // Optimize CSS minification
      cssMinify: isProduction,
      // Report compressed size for better build analysis
      reportCompressedSize: true,
    },

    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
    },

    // Optimize dependencies for faster dev server startup
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'zustand',
        'lucide-react',
        'framer-motion',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },

    // Enable JSON tree-shaking
    json: {
      stringify: true,
    },

    // Experimental features for better performance
    esbuild: {
      // Remove console and debugger in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Legal comments handling
      legalComments: 'none',
    },
  }
})
