/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        canvas: false,
        module: false,
        path: false,
        os: false,
        crypto: false,
      };
    }

    return config;
  },
  // Enable experimental features for ES modules
  experimental: {
    esmExternals: 'loose',
    forceSwcTransforms: true // Force SWC transforms
  },
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/ramadan',
        destination: '/campaigns/ramadhan',
        permanent: true,
      },
      {
        source: '/ramadhan',
        destination: '/campaigns/ramadhan',
        permanent: true,
      },
      {
        source: '/path',
        destination: '/campaigns/vision',
        permanent: true,
      },
      {
        source: '/the-path',
        destination: '/campaigns/vision',
        permanent: true,
      },
      {
        source: '/thepath',
        destination: '/campaigns/vision',
        permanent: true,
      },
    ]
  },
  transpilePackages: ['@react-pdf/renderer'],
};

module.exports = nextConfig

