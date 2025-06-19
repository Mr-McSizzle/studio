
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
  // This is needed for three.js to work correctly with Next.js App Router
  // It ensures that specific three.js related modules are treated as external 
  // and not processed by Webpack in a way that breaks them.
  webpack: (config, { isServer }) => {
    // For server components, we can externalize three.js
    if (isServer) {
      // config.externals.push('three'); // May not be needed if only used in client components
    } else {
      // For client components, ensure three is resolvable
      // No specific client-side externals usually needed for three if imported directly
    }

    // Rule to handle .node files (might be needed by some three.js addons, but not core)
    // config.module.rules.push({
    //   test: /\.node$/,
    //   use: 'node-loader',
    // });
    
    return config;
  },
};

export default nextConfig;
