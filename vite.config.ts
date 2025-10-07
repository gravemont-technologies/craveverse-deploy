// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "CraveVerse",
        short_name: "CraveVerse",
        description: "AI-powered craving conquest with gamified rewards and community insights",
        theme_color: "#ffffff",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  optimizeDeps: {
    // help Vite pre-bundle commonly used deps referenced in the project
    include: [
      "@react-spring/web",
      "@supabase/supabase-js",
      "posthog-js",
      "@radix-ui/react-slider",
      "framer-motion",
      "sonner",
      "lucide-react"
    ]
  },
  server: {
    port: 5173,
    fs: {
      // allow serving files from one level up to support monorepos if needed
      allow: [".."]
    }
  },
  build: {
    sourcemap: true,
    // tweak rollup options if you have large SVGs/assets
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        }
      }
    }
  }
});

});
