/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true, // Required for static exports
  },
  // Disable server components for static export
  experimental: {
    appDir: true,
  },
  // Add trailing slash for better compatibility with Static Web Apps
  trailingSlash: true,
};

export default nextConfig; 