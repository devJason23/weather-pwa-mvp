import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    middlewareClientMaxBodySize: "1gb",
    serverActions: {
      bodySizeLimit: "1gb"
    }
  }
};

export default nextConfig;
