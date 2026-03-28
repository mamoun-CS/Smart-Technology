/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: process.env.NEXT_PUBLIC_IMAGE_DOMAINS?.split(',') || ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
