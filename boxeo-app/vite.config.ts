import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Custom plugin to inject "built by scout" tag
function injectBuiltByScoutPlugin() {
  return {
    name: 'inject-built-by-scout',
    transformIndexHtml(html: string) {
      // Inject the scout tag script reference
      const scriptTag = '<script defer src="/scout-tag.js"></script>';
      
      // Inject the script before the closing body tag
      return html.replace('</body>', scriptTag + '\n  </body>');
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), injectBuiltByScoutPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimizations for production
  build: {
    // Enable minification
    minify: 'esbuild',
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-tabs'],
        },
      },
    },
    // Generate source maps for debugging
    sourcemap: false, // Disable in production for smaller bundle
    // Target modern browsers for smaller bundle
    target: 'esnext',
  },
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
  // Development server configuration
  server: {
    port: 5173,
    host: true,
  },
});
