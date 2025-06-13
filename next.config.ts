import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  env: {
    ADMIN_SECRET_PATH: process.env.ADMIN_SECRET_PATH || 'xwayp-admin-2024',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'xwayp2024secure',
  },
};

export default nextConfig;
