import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "media-bucket-chatter.s3.us-east-1.amazonaws.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
