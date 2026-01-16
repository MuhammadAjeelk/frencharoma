/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.linea-debella.com',
        pathname: '/cdn/shop/**',
      },
      {
        protocol: 'https',
        hostname: 'saeedghani.pk',
        pathname: '/cdn/shop/**',
      },
    ],
  },
};

export default nextConfig;
