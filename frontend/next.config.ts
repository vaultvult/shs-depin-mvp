import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add this line to satisfy Next.js 16 requirements
  turbopack: {},
  webpack: (config) => {
    // Tell Webpack to ignore these optional packages by aliasing them to false
    config.resolve.alias = {
      ...config.resolve.alias,
      '@solana/kit': false,
      '@solana-program/memo': false,
      '@solana-program/system': false,
      '@solana-program/token': false,
      'accounts': false,
      '@metamask/connect-evm': false,
      '@farcaster/mini-app-solana': false,
    };
    return config;
  },
};

export default nextConfig;
