import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // using the `webapp` base path for production builds
  // So we can leverage Phoenix static assets plug to deliver
  // our React app directly from our final Elixir app,
  // Serving all files from the `priv/static/webapp` folder.
  // NOTE: Remember to move the frontend build files to the
  // `priv` folder during the application build process in CI
  // @ts-ignore
  base: process.env.NODE_ENV === "production" ? "/webapp/" : "/",
});