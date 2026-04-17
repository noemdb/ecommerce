// next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "*.uploadthing.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  // Manually resolve next-intl config because the official plugin
  // still uses the deprecated 'experimental: { turbo: ... }' key
  // which causes warnings/errors in Next.js 16.2 stable Turbopack.
  turbopack: {
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts"
    }
  }
};

export default nextConfig;
