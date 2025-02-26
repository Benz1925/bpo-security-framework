/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable server-side features when using static export
  trailingSlash: true,
};

export default nextConfig;
