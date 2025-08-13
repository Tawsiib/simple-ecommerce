/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    domains: ['localhost', '127.0.0.1', 'shohanis-reflection.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
