import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * A conventional static build for the Tencent Lighthouse server.
 * This is kept separate from the existing Cloudflare/Vinext configuration so
 * the current local preview and Worker deployment remain untouched.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-server",
    emptyOutDir: true,
  },
});
