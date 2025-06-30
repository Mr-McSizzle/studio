
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
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
  experimental: {
    allowedDevOrigins: ['https://6000-firebase-studio-1749659292414.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev'],
  },
  webpack: (config, { isServer }) => {
    // You can add custom webpack configurations here if needed in the future.
    return config;
  },
};

export default nextConfig;
