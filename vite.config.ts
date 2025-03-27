import path from 'path';
import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost", // Restrict to localhost only
    port: 8080,
    cors: false, // Disable CORS in development
    hmr: {
      // Improve HMR security
      clientPort: 8080,
      host: 'localhost',
    },
    strictPort: true,
    headers: {
      // Security headers even in development
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    },
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Improve production build security
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'],
      },
      format: {
        comments: false,
      },
    },
    // Aumentar o limite de aviso para chunks grandes
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Agrupar node_modules por pacotes principais
          if (id.includes('node_modules')) {
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router')) {
              return 'vendor-react';
            }
            
            if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('vaul')) {
              return 'vendor-ui';
            }
            
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'vendor-animations';
            }
            
            if (id.includes('recharts') || id.includes('d3') || id.includes('victory')) {
              return 'vendor-charts';
            }
            
            if (id.includes('date-fns') || id.includes('crypto-js') || id.includes('zod')) {
              return 'vendor-utils';
            }
            
            return 'vendor'; // todos os outros node_modules
          }
          
          // Agrupar código da aplicação por características
          if (id.includes('/components/')) {
            if (id.includes('/ui/')) {
              return 'ui-components';
            }
            return 'components';
          }
          
          if (id.includes('/lib/')) {
            return 'lib';
          }
          
          if (id.includes('/pages/')) {
            return 'pages';
          }
        }
      },
    },
  },
  define: {
    // Define production environment variables
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
