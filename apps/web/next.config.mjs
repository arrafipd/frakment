import { createMDX } from "fumadocs-mdx/next";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

const { LINK } = await jiti.import("./constants/links");
const { ROUTES } = await jiti.import("./constants/routes");

const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
  : "'self' 'unsafe-inline' https://va.vercel-scripts.com";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `default-src 'self'; base-uri 'self'; connect-src 'self' https://vitals.vercel-insights.com; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' https: data: blob:; object-src 'none'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'`,
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/frakment" : "",
  devIndicators: false,
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "@icons-pack/react-simple-icons",
    ],
  },
  headers() {
    const link = [
      `<${ROUTES.API_CATALOG}>; rel="api-catalog"`,
      `<${ROUTES.OPENAPI}>; rel="service-desc"`,
      `</frakment${ROUTES.DOCS}>; rel="service-doc"`,
      `<${LINK.FRAKMENT_MCP_DOCS}>; rel="service-doc"; title="Frakment MCP server"`,
      `<${ROUTES.AGENT_SKILLS_INDEX}>; rel="describedby"`,
    ].join(", ");

    return [
      {
        headers: securityHeaders,
        source: "/:path*",
      },
      {
        headers: [{ key: "Link", value: link }],
        source: `/frakment${ROUTES.HOME}`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
      {
        hostname: "images.unsplash.com",
        protocol: "https",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*"],
  },
  redirects() {
    return [
      {
        destination: ROUTES.DOCS_INSTALLATION,
        permanent: false,
        source: ROUTES.DOCS,
      },
      {
        destination: `${ROUTES.DOCS}.md`,
        permanent: true,
        source: `${ROUTES.DOCS}.mdx`,
      },
      {
        destination: `${ROUTES.DOCS}/:path*.md`,
        permanent: true,
        source: `${ROUTES.DOCS}/:path*.mdx`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/button`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/button`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/separator`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/separator`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/button-group`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/button-group`,
      },

      {
        destination: `${ROUTES.DOCS}/components/web/popover`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/popover`,
      },

      {
        destination: `${ROUTES.DOCS}/components/web/dropdown-menu`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/dropdown-menu`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/select`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/select`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/badge`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/badge`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/avatar`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/avatar`,
      },
      {
        destination: `${ROUTES.DOCS}/components/native/button`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/expo/button`,
      },
      {
        destination: `${ROUTES.DOCS}/components/native/button.md`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/expo/button.md`,
      },
      {
        destination: `${ROUTES.DOCS}/components/react/button.md`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/button.md`,
      },
    ];
  },
  transpilePackages: ["@frakment/ai", "@frakment/react"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
