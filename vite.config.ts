import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

const ignoreWellKnownRoutes: Plugin = {
  name: "ignore-well-known-routes",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith("/.well-known/")) {
        res.writeHead(404).end();
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [tailwindcss(), ignoreWellKnownRoutes, reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
