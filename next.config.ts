import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
  webpack: (config, { isServer }) => {
    // Ignore warnings from handlebars
    config.ignoreWarnings = [
      { module: /node_modules\/handlebars\/lib\/index\.js/ }
    ];
    
    // You can add custom webpack configurations here if needed in the future.
    return config;
  },
};

export default nextConfig;