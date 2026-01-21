import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Optimize webpack configuration to prevent timeouts
  webpack: (config, { dev, isServer }) => {
    // Increase timeout for chunk loading in development
    if (dev) {
      config.devServer = {
        ...config.devServer,
        client: {
          webSocketTimeout: 120000, // 2 minutes
        },
      };
    }

    // Optimize chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    };

    return config;
  },
  // Increase timeout for static page generation
  staticPageGenerationTimeout: 180,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Enable SWC minification for faster builds
  swcMinify: true,
};

export default nextConfig;
