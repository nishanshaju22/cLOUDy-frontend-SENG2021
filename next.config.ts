import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // When your code calls /api-proxy/v1/buyer...
        source: '/api-proxy/:path*',
        // ...Vercel fetches it from your actual HTTP backend
        destination: 'http://cloudy-1831309437.us-east-1.elb.amazonaws.com/api/:path*', 
      },
    ]
  },
};

export default nextConfig;
