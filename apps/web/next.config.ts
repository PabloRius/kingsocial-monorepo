import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/shared-types", "@repo/shared-models"],
};

export default nextConfig;
