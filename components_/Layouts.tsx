import Head from 'next/head';
import Navigation from '../components/core/Navigation';
import Footer from '../components/core/Footer';

export const Layout = ({ children }) => (
  <>
    <Head>
      <title>Kinship Canada</title>
    </Head>
    <main id="app" className="min-h-screen">
      <Navigation />
        { children }
      <Footer />
    </main>
  </>
);

export function AppLayout() {
    return (
        <div></div>
    )
}

