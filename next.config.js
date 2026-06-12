/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'allbotix.s3.eu-north-1.amazonaws.com',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production' && process.env.HOSTINGER === 'true',
  },
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
}

module.exports = nextConfig
