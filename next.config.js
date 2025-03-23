/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
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
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS,PUT,DELETE" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 