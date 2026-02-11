import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@crivline/db', '@crivline/types'],
};

export default nextConfig;
