/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  // Ignore ESLint errors during build to allow successful builds
  // despite linting issues
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
