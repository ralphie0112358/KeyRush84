import { defineConfig } from "vite";

// Set GH_PAGES_BASE when building for GitHub Pages, e.g. "/keyrush84/"
const base = process.env.GH_PAGES_BASE || "/";

export default defineConfig({
  base
});
