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
    unoptimized: true,
  },
  output: 'export',
  webpack: (config, { isServer }) => {
    // Ignore warnings from handlebars
    config.ignoreWarnings = [
      { module: /node_modules\/handlebars\/lib\/index\.js/ }
    ];
    
    // You can add custom webpack configurations here if needed in the future.
    return config;
  },
};

module.exports = nextConfig;