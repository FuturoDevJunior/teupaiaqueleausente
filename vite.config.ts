import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
<<<<<<< HEAD
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
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://media1.giphy.com; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; form-action 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    },
=======
    host: "::",
    port: 8080,
>>>>>>> 6c6de67a40eba9778a1efbb3bde2900661421378
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
<<<<<<< HEAD
  build: {
    // Improve production build security
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            // Other UI dependencies can be listed here
          ],
        },
      },
    },
  },
  define: {
    // Define production environment variables
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
=======
>>>>>>> 6c6de67a40eba9778a1efbb3bde2900661421378
}));
