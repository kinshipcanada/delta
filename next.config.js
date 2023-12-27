module.exports = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/auth/register',
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
};

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "kinship-canada",
    project: "javascript-nextjs",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);

