import React from 'react';
import Layout from '../components/core/Layout';
import '../styles/globals.css';
import ReactTooltip from 'react-tooltip';

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
      <ReactTooltip />
    </Layout>
  );
}
