import React from 'react';
import Layout from '../components/core/Layout';
import '../styles/globals.css';
import ReactTooltip from 'react-tooltip';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
      <ReactTooltip />
      <Toaster />
    </Layout>
  );
}

export { reportWebVitals } from 'next-axiom';