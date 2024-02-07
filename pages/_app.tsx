import React from 'react';
import { Layout } from '../components/prebuilts/Layouts';
import '../styles/globals.css';
import ReactTooltip from 'react-tooltip';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app'
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Theme appearance="light" panelBackground="solid" scaling="110%">
      <Layout>
        <Component {...pageProps} />
        <ReactTooltip />
        <Toaster />
      </Layout>
    </Theme>
  )
}
