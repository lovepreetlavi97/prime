/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.1.112', '192.168.1.15'],
  devIndicators: {
    buildActivity: false,
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {},
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:4000/socket.io/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
