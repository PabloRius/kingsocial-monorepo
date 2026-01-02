/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared-types"],
  transpilePackages: ["@repo/database"],
  images: {
    remotePatterns: [{ hostname: "res.cloudinary.com" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
