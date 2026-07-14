import type { MetadataRoute } from "next";

const THEME = "#6f8f3e";
const BACKGROUND = "#e9f2df";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SchooliAT",
    short_name: "SchooliAT",
    description:
      "School management dashboard for administrators — attendance, fees, staff, and more.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: BACKGROUND,
    theme_color: THEME,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
