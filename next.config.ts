import type { NextConfig } from "next";

// BUILD_TARGET=mobile produces a fully static export (out/) for the Capacitor
// shell. The default build keeps server API routes (/api/analyze) for hosting.
const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  // trailingSlash makes every route a directory index (trending/index.html),
  // which the Capacitor asset server and any static host resolve directly.
  ...(isMobileBuild ? { output: "export" as const, trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
