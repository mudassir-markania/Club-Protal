/** @type {import('next').NextConfig} */

// Where the backend API runs. The browser keeps calling /api/... on the frontend origin and Next forwards it,
// so cookies (login) stay same-origin and no CORS setup is needed.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5022';

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: false,
  // @club-portal/shared ships TypeScript source
  transpilePackages: ['@club-portal/shared'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
