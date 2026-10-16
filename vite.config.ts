import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const OG_IMAGE_PATH = "/assets/og/og-share.jpg";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL?.replace(/\/$/, "") ?? "";
  const ogImageAbsolute = siteUrl ? `${siteUrl}${OG_IMAGE_PATH}` : OG_IMAGE_PATH;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "inject-og-image",
        transformIndexHtml(html) {
          return html.replaceAll("__OG_IMAGE__", ogImageAbsolute);
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
