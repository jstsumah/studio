/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from
    // the preview server.
    allowedDevOrigins: ['https://*.cloudworkstations.dev'],
    // Ensures the development indicator and dev tools are available.
    devTools: true,
  },
};

module.exports = nextConfig;
