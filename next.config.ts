import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://cloudy-1831309437.us-east-1.elb.amazonaws.com/:path*'
      }
    ]
  }
  /* config options here */
};

export default nextConfig;
