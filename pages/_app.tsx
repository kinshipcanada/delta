import React from 'react';
import { Layout } from '../components/prebuilts/Layouts';
import '../styles/globals.css';
import ReactTooltip from 'react-tooltip';
import { Toaster } from 'react-hot-toast';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
// pages/_app.js
import posthog from "posthog-js"
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') { // checks that we are client-side
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug() // debug mode in development
    },
  })
}

export default function App({ Component, pageProps: { session, ...pageProps } }: any) {
  return (
    <PostHogProvider client={posthog}>
      <Theme appearance="light" panelBackground="solid" scaling="110%">
        <Layout>
          <Component {...pageProps} />
          <ReactTooltip />
          <Toaster />
        </Layout>
      </Theme>
    </PostHogProvider>
  )
}
