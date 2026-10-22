import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite is built into Node, keep it out of the bundle
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
