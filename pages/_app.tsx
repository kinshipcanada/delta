import React from 'react';
import { Layout } from '../components/prebuilts/Layouts';
import '../styles/globals.css';
import ReactTooltip from 'react-tooltip';
import { Toaster } from 'react-hot-toast';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

// Simple error boundary without any logging
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

function MyApp({ Component, pageProps }: any) {
  return (
    <ErrorBoundary>
      <Theme appearance="light" panelBackground="solid" scaling="110%">
        <Layout>
          <Component {...pageProps} />
          <ReactTooltip />
          <Toaster />
        </Layout>
      </Theme>
    </ErrorBoundary>
  );
}

export default MyApp;
