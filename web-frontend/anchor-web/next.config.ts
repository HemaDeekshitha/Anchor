import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export const headers = async () => [
  {
    source: "/(.*)",
    headers: [
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Content-Security-Policy",
        value: "frame-ancestors 'none'",
      },
    ],
  },
];

export default nextConfig;
