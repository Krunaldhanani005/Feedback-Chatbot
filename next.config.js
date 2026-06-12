/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma needs server-only runtime
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Standalone output required for Hostinger Node.js deployment
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Disable image optimization on Hostinger (no sharp binary support)
  images: {
    unoptimized: process.env.HOSTINGER === 'true',
    remotePatterns: [
      { protocol: 'https', hostname: 'allbotix.s3.eu-north-1.amazonaws.com' },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',       value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
