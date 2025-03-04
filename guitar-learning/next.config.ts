/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Required for GitHub Pages in Next.js 15+
  images: {
    unoptimized: true, // Fixes images not working on GitHub Pages
  },
  basePath: "/guitar-learning", // Adjust this based on your GitHub repository name
  assetPrefix: "/guitar-learning/", // Ensures correct asset loading
};

module.exports = nextConfig;
