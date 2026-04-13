/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'assets.yourdomain.com', // jika pake custom domain
      },
    ],
  },
}

module.exports = nextConfig