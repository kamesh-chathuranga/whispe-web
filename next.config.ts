import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "media-bucket-chatter.s3.us-east-1.amazonaws.com",
    ], // Allow Google avatars
  },
};

export default nextConfig;
