import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@flagline/db', '@flagline/types'],
};

export default nextConfig;
