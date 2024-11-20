import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "upbeat-stoat-959.convex.cloud", protocol: "https" },
    ],
  },
};

export default nextConfig;
