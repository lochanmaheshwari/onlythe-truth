import type { NextConfig } from "next";

const isExport = process.env.NEXT_EXPORT === 'true' || process.env.CAPACITOR === 'true';

const nextConfig: NextConfig = {
  ...(isExport ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
