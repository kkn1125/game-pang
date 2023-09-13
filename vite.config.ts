import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      host: process.env.HOST,
      port: Number(process.env.PORT) || 5000,
    },
    // plugins: [react()],
    resolve: {
      alias: [{ find: "@src", replacement: path.resolve("src") }],
    },
    build: {
      minify: true,
    },
    esbuild: {
      minifyIdentifiers: false,
    },
  };
});
