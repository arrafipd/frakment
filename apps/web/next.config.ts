import { createMDX } from "fumadocs-mdx/next";
import { LINK } from "./config/links";
import { ROUTES } from "./config/routes";

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
      `<${ROUTES.apiCatalog}>; rel="api-catalog"`,
      `<${ROUTES.OPENAPI}>; rel="service-desc"`,
      `</frakment${ROUTES.DOCS}>; rel="service-doc"`,
      `<${LINK.frakmentMcpDocs}>; rel="service-doc"; title="Frakment MCP server"`,
      `<${ROUTES.agentSkillsIndex}>; rel="describedby"`,
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
        destination: ROUTES.docsInstallation,
        permanent: false,
        source: ROUTES.DOCS,
      },
      {
        destination: `${ROUTES.DOCS}.md`,
        permanent: true,
        source: `${ROUTES.DOCS}.mdx`,
      },
      {
        destination: `${ROUTES.docsAiElements}/chat`,
        permanent: true,
        source: `${ROUTES.docsLibraries}/ai`,
      },
      {
        destination: ROUTES.docsComposites,
        permanent: true,
        source: `${ROUTES.DOCS}/modules`,
      },
      {
        destination: `${ROUTES.docsComposites}/:path*`,
        permanent: true,
        source: `${ROUTES.DOCS}/modules/:path*`,
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
        destination: `${ROUTES.DOCS}/components/web/number-flow`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/number-flow`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/separator`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/separator`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/spinner`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/spinner`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/card`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/card`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/pagination`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/pagination`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/marker`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/marker`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/attachment`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/attachment`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/switch`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/switch`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/progress`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/progress`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/dialog`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/dialog`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/item`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/item`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/checkbox`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/checkbox`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/empty`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/empty`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/field`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/field`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/code-block`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/code-block`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/hover-card`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/hover-card`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/tabs`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/tabs`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/textarea`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/textarea`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/slider`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/slider`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/tooltip`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/tooltip`,
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
        destination: `${ROUTES.DOCS}/components/web/accordion`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/accordion`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/breadcrumb`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/breadcrumb`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/input-otp`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/input-otp`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/input-group`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/input-group`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/input`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/input`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/collapsible`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/collapsible`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/label`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/label`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/message`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/message`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/message`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/bubble`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/message`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/message-scroller`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/message`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/message-animated`,
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
      {
        destination: `${ROUTES.DOCS}/components/web/radio-group`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/radio-group`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/sheet`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/sheet`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/toggle`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/toggle`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/toggle-group`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/toggle-group`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/trace`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/trace`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/sonner`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/sonner`,
      },
      {
        destination: `${ROUTES.DOCS}/components/web/slot`,
        permanent: false,
        source: `${ROUTES.DOCS}/components/slot`,
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
