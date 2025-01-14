import nextMDX from '@next/mdx';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const withMDX = nextMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // Configure `images` to support loading images from a remote server
  images: {
    //unoptimized: true,
    //minimumCacheTTL: 60 * 60 * 24 * 3, // 3 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2sqltdcj8czo5.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@repo/ui/*'],
  },
  transpilePackages: ['@repo/ui'],
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    // silence webpack cache errors
    config.infrastructureLogging = {
      level: 'error',
    };

    return config;
  },
};

export default withMDX(nextConfig);
