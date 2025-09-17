/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use a custom distDir to avoid OneDrive/AV locks on `.next` for local development
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  // Avoid writing `.next/trace` which can fail on locked folders in development
  outputFileTracing: process.env.NODE_ENV !== 'development',
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
