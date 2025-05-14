import Error from "next/error";
import posthog from "posthog-js";

const CustomErrorComponent = (props) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  const { res, err } = contextData;
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  
  if (typeof window !== 'undefined') {
    const errorToCapture = err || new Error(`_error.js - status ${statusCode}`);
    
    posthog.captureException(errorToCapture, {
      statusCode: statusCode,
      url: window.location.href,
      type: 'unhandled_error'
    });
  } else {
    try {
      const { posthogLogger } = require('../lib/posthog-server');
      const errorToCapture = err || new Error(`Server error - status ${statusCode}`);
      posthogLogger(errorToCapture, 'next_error_page');
    } catch (e) {
      console.error('Failed to log server-side error to PostHog:', e);
    }
  }

  return {
    statusCode,
  };
};

export default CustomErrorComponent;
