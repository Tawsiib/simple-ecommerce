/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    domains: ['localhost', 'shohanis-reflection.com'],
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
