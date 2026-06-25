/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  /* config options here */
  typescript: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {},
  webpack: (config, { isServer }) => {
    // You can add custom webpack configurations here if needed in the future.
    return config;
  },
};

export default nextConfig;
