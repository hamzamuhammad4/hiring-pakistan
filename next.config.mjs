/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['hiringpakistan.co', 'localhost', 'firebasestorage.googleapis.com'],
  },
  output: 'standalone',
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;