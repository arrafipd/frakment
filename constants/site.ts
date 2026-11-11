export const FALLBACK_SITE_ORIGIN = "https://www.arrafi.dev/frakment" as const;

const getBaseUrl = () => {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    return siteUrl;
  }

  if (process.env.VERCEL_ENV === "production") {
    throw new Error(
      "SITE_URL is required in production. Set it in Vercel env vars."
    );
  }

  return FALLBACK_SITE_ORIGIN;
};

const baseUrl = getBaseUrl();

export const SITE = {
  AUTHOR: {
    NAME: "arrafipd",
    TWITTER: "@arrafipd",
  },
  DESCRIPTION: {
    LONG: "Composable, accessible, customizable components with motion built in — nothing to assemble, no wiring, no configuration.",
    SHORT: "The Fragments behind your Design System",
  },
  KEYWORDS: [
    "Frakment",
    "component registry",
    "monochrome",
    "design system",
    "next.js",
    "tailwindcss",
    "npx frakment add",
  ] as const,
  NAME: "Frakment",
  OG_IMAGE: `${baseUrl}/og`,
  REGISTRY: baseUrl,
  URL: baseUrl,
};

export const META_THEME_COLORS = {
  dark: "#09090b",
  light: "#ffffff",
};

export const UTM_PARAMS = {
  utm_source: new URL(baseUrl).hostname,
};
