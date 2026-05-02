import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Deezer
      { protocol: "https", hostname: "*.dzcdn.net" },
      { protocol: "https", hostname: "api.deezer.com" },
      { protocol: "https", hostname: "e-cdns-images.dzcdn.net" },
      { protocol: "https", hostname: "cdns-images.dzcdn.net" },
      // Jamendo
      { protocol: "https", hostname: "usercontent.jamendo.com" },
      { protocol: "https", hostname: "*.jamendo.com" },
      // Spotify CDN
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      // Fallback — cho phép tất cả HTTPS
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
