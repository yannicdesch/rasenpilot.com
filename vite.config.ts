import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { staticSeoPlugin } from "./vite-plugin-static-seo";
import { sitemapPlugin } from "./vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      staticSeoPlugin(),
      sitemapPlugin({
        supabaseUrl: env.VITE_SUPABASE_URL,
        supabaseAnonKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    publicDir: "public",
    build: {
      target: "es2020",
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-query": ["@tanstack/react-query"],
            "vendor-ui": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip",
              "@radix-ui/react-popover",
            ],
            "vendor-charts": ["recharts"],
            "vendor-supabase": ["@supabase/supabase-js"],
            "vendor-helmet": ["react-helmet-async"],
          },
        },
      },
      copyPublicDir: true,
    },
  };
});