import Head from 'next/head';
import Navigation from '../components/core/Navigation';
import Footer from '../components/core/Footer';
import AppNavigation from './app/Navigation';

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

export function AppLayout({ children }) {
    return (
        <div className='p-10 grid grid-cols-4 gap-12'>
            <AppNavigation />
        </div>
    )
}

