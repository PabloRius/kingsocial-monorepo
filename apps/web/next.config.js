/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared-types"],
  transpilePackages: ["@repo/database"],
};

module.exports = nextConfig;
