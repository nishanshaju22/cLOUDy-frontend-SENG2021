import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // When your code calls /api-proxy/v1/buyer...
        source: '/api-proxy/:path*',
        // ...Vercel fetches it from your actual HTTP backend
        destination: 'https://cloudy-backend-seng2021-production.up.railway.app/api/:path*', 
      },
    ]
  },
};

export default nextConfig;
