import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';

const Layout = ({ children }) => (
  <>
    <Head>
      <title>Kinship Canada</title>
    </Head>
    <main id="app" className="d-flex flex-column h-100" data-testid="layout">
      <Navigation />
      { children }
      <Footer />
    </main>
  </>
);

export default Layout;
