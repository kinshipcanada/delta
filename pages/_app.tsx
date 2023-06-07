import React from 'react';
import { Layout } from '../components_/prebuilts/Layouts';
import '../styles/globals.css';
import ReactTooltip from 'react-tooltip';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <ReactTooltip />
      <Toaster />
    </Layout>
  )
}
