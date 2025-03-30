import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      // Add other IPFS gateways if needed
      {
        protocol: "https",
        hostname: "*.ipfs.dweb.link",
      },
      {
        protocol: "https",
        hostname: "ipfs.infura.io",
      },
    ],
  },
  // ... other config options
};

module.exports = nextConfig;

export default nextConfig;
