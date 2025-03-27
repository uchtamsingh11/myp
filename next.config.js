const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
      enabled: true,
    })
    : config => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Add your external domains here if needed
  poweredByHeader: false, // Security: Removes the X-Powered-By header
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
          exclude: ['error', 'warn'],
        }
        : false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Enabling this will allow production builds to successfully complete even with TypeScript errors
    // Recommended to keep this false in production to ensure type safety
    ignoreBuildErrors: true,
  },
  // Server Actions are enabled by default in Next.js 14
  // No need for experimental options for serverComponents or serverActions
  output: 'standalone',
  webpack: (config, { dev }) => {
    // Disable caching in development mode to prevent ENOENT errors
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in /api
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS,PUT,DELETE' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
