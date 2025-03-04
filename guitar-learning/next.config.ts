import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  // Configure base path for GitHub Pages
  basePath: '/guitar-learning',
  assetPrefix: '/guitar-learning'
};

export default nextConfig;
