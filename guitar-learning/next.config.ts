/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Important for GitHub Pages
  },
  basePath: "/guitar-learning", // GitHub Pages expects this
  assetPrefix: "/guitar-learning/",
};

module.exports = nextConfig;
