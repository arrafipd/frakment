export const FALLBACK_SITE_ORIGIN = "https://frakment.vercel.app" as const;

const getBaseUrl = () => {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return process.env.SITE_URL ?? FALLBACK_SITE_ORIGIN;
};

const baseUrl = getBaseUrl();

export const SITE = {
  AUTHOR: {
    NAME: "hanshapd",
    TWITTER: "@hanshapd",
  },
  DESCRIPTION: {
    LONG: "A monochrome component registry. Neutral by nature, precise by design.",
    SHORT: "A monochrome component registry",
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
