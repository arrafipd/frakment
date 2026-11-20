export const fallbackSiteOrigin = "https://www.arrafi.dev/frakment" as const;

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

  return fallbackSiteOrigin;
};

const baseUrl = getBaseUrl();

export const SITE = {
  AUTHOR: {
    NAME: "arrafipd",
    TWITTER: "@arrafipd",
  },
  DESCRIPTION: {
    LONG: "Components drop in from the registry directly, adapt to your theme natively, and move with your interface smoothly.",
    SHORT: "Drop in directly, adapt natively, move smoothly.",
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
  ogImage: `${baseUrl}/og`,
  REGISTRY: baseUrl,
  URL: baseUrl,
};

export const metaThemeColors = {
  dark: "#09090b",
  light: "#ffffff",
};

export const utmParams = {
  utm_source: new URL(baseUrl).hostname,
};
