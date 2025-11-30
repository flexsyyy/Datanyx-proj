import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()], // Removed lovable-tagger as it's optional and causing install issues
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
