import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3002,
    allowedHosts: [
      "xistracloud.com",
      "www.xistracloud.com",
    ],
    watch: {
      ignored: ["**/backend/**"],
    },
  },
  preview: {
    host: true,
    port: 3002,
    allowedHosts: [
      "xistracloud.com",
      "www.xistracloud.com",
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
