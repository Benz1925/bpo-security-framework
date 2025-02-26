/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable server-side features when using static export
  trailingSlash: true,
  // Environment variables that will be available at build time
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    // You can add default values here, which will be overridden by actual env vars if present
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
};

export default nextConfig;
