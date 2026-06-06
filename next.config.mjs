// next.config.js - UPDATED FOR HOSTINGER VPS
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['hiringpakistan.co', 'localhost', 'firebasestorage.googleapis.com'],
    unoptimized: true, // Required for static export
  },
  output: 'export',  // ← CHANGE THIS from 'standalone' to 'export'
  trailingSlash: true, // ← CHANGE to true for better compatibility
  reactStrictMode: true,
};

export default nextConfig;