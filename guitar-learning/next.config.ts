/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Required for static site export
  images: {
    unoptimized: true, // Fixes images not working on GitHub Pages
  },
  basePath: "/guitar-learning", // Must match GitHub repo name
  assetPrefix: "/guitar-learning/", // Ensures assets load from correct URL
};

module.exports = nextConfig;
