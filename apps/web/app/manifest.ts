import type { MetadataRoute } from "next";

import { META_THEME_COLORS, SITE } from "@/constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: META_THEME_COLORS.light,
    description: SITE.DESCRIPTION.LONG,
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/frakment/android-chrome-192x192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/frakment/android-chrome-512x512.png",
        type: "image/png",
      },
    ],
    name: SITE.NAME,
    short_name: SITE.NAME,
    start_url: "/frakment",
    theme_color: META_THEME_COLORS.light,
  };
}
