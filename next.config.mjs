/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true, // Required for static exports
  },
  // Add trailing slash for better compatibility with Static Web Apps
  trailingSlash: true,
  // Disable eslint during build to prevent failing on warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure proper module resolution
  experimental: {
    esmExternals: true,
  },
  // Handle basePath for Azure Static Web Apps
  basePath: '',
  // Configure module resolution
  webpack: (config) => {
    return config;
  },
};

export default nextConfig; 