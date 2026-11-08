import { createMDX } from "fumadocs-mdx/next";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

const { LINK } = await jiti.import("./constants/links");
const { ROUTES } = await jiti.import("./constants/routes");

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/frakment",
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
        destination: `${ROUTES.DOCS}.md`,
        permanent: true,
        source: `${ROUTES.DOCS}.mdx`,
      },
      {
        destination: `${ROUTES.DOCS}/:path*.md`,
        permanent: true,
        source: `${ROUTES.DOCS}/:path*.mdx`,
      },
    ];
  },
  transpilePackages: ["@frakment/ai", "@frakment/react"],
  typescript: { ignoreBuildErrors: true },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
