/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.linea-debella.com",
        pathname: "/cdn/shop/**",
      },
      {
        protocol: "https",
        hostname: "saeedghani.pk",
        pathname: "/cdn/shop/**",
      },
      {
        protocol: "https",
        hostname: "frencharoma.sparksgate.com",
        pathname: "/uploads/**",
      },
      // New home. The old sparksgate host stays listed so anything still
      // holding an old URL keeps resolving.
      {
        protocol: "https",
        hostname: "frencharomas.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.frencharomas.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "staging.frencharomas.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
