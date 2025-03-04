/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",  // REQUIRED for static export
  basePath: "/guitar-learning",  // Fix paths on GitHub Pages
  assetPrefix: "/guitar-learning/",  // Ensure assets load correctly
  images: { unoptimized: true },  // Fix potential image issues
};

module.exports = nextConfig;
