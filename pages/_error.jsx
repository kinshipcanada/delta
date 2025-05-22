import Error from "next/error";

const CustomErrorComponent = (props) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  const { res, err, req } = contextData;
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  
  const errorToCapture = err || new Error(`Error - status ${statusCode}`);
  
  try {
    // Get the absolute URL for the API route
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = req?.headers?.host || 'localhost:3000';
    const apiUrl = `${protocol}://${host}/api/log-error`;

    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          message: errorToCapture.message,
          stack: errorToCapture.stack,
          name: errorToCapture.name
        },
        context: {
          statusCode,
          type: 'server_error',
          path: contextData.pathname
        }
      })
    });
  } catch (loggingError) {
    console.error('Failed to log server-side error:', {
      originalError: errorToCapture,
      loggingError
    });
  }

  return {
    statusCode,
  };
};

export default CustomErrorComponent;
