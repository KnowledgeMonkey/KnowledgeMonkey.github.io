/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/guitar-learning",
  assetPrefix: "/guitar-learning/", // Important for correct asset paths!
  images: { unoptimized: true },
  distDir: "out", // Ensures files go into "out/" after build
};

module.exports = nextConfig;
