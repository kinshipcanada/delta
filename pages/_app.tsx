import React, { useEffect } from 'react';
import { Layout } from '../components/prebuilts/Layouts';
import '../styles/globals.css';
import ReactTooltip from 'react-tooltip';
import { Toaster } from 'react-hot-toast';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import posthog from "posthog-js";
import { PostHogProvider } from 'posthog-js/react';

// Initialize PostHog only on client side
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    },
  });
}

// Error boundary as a class component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to PostHog
    if (typeof window !== 'undefined') {
      posthog.captureException(error, {
        componentStack: errorInfo.componentStack,
        location: window.location.href
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. We've logged the error.</h1>;
    }
    return this.props.children;
  }
}

function MyApp({ Component, pageProps }: any) {
  return (
    <PostHogProvider client={posthog}>
      <ErrorBoundary>
        <Theme appearance="light" panelBackground="solid" scaling="110%">
          <Layout>
            <Component {...pageProps} />
            <ReactTooltip />
            <Toaster />
          </Layout>
        </Theme>
      </ErrorBoundary>
    </PostHogProvider>
  );
}

export default MyApp;
