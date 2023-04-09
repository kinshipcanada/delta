const { withAxiom } = require('next-axiom')

module.exports = withAxiom({
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
});