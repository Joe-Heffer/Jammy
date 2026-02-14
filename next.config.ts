import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Spotify/external album art images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "*.spotifycdn.com" },
    ],
  },
};

export default nextConfig;
