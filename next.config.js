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
    ]
  },
});