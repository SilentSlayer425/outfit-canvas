import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "node:child_process";
import { componentTagger } from "lovable-tagger";

const TOS_FILE_PATH = "src/pages/TermsOfService.tsx";

const getTermsOfServiceLastUpdated = () => {
  if (process.env.TOS_LAST_UPDATED) {
    return process.env.TOS_LAST_UPDATED;
  }

  try {
    const output = execSync(`git log -1 --format=%cI -- ${TOS_FILE_PATH}`, {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    return output || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    hmr: {
      overlay: false,
      clientPort: 443,
      protocol: 'wss',
      host: 'ce03c27d-50eb-4117-96bb-a3dfee01a800.preview.emergentagent.com',
    },
    allowedHosts: true,  // Allow all hosts in development
  },
  preview: {
    port: 8080,
    strictPort: true,
    host: "0.0.0.0",
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    __TOS_LAST_UPDATED__: JSON.stringify(getTermsOfServiceLastUpdated()),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));