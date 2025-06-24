import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get environment variables
  const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
  const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
  const isProd = process.env.NODE_ENV === 'production';

  // Select the appropriate secret key based on environment
  let PLAID_SECRET: string | undefined;
  if (PLAID_ENV === 'production') {
    PLAID_SECRET = process.env.PLAID_PROD_SECRET_KEY;
  } else if (PLAID_ENV === 'development') {
    PLAID_SECRET = process.env.PLAID_DEV_SECRET_KEY;
  } else {
    PLAID_SECRET = process.env.PLAID_SANDBOX_SECRET_KEY;
  }

  // Initialize Plaid client
  const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
        'Plaid-Version': '2020-09-14',
      },
    },
  });
  const plaidClient = new PlaidApi(configuration);

  // Check environment variables
  const envCheck = {
    PLAID_ENV: PLAID_ENV,
    PLAID_CLIENT_ID_EXISTS: !!PLAID_CLIENT_ID,
    PLAID_SANDBOX_SECRET_EXISTS: !!process.env.PLAID_SANDBOX_SECRET_KEY,
    PLAID_DEV_SECRET_EXISTS: !!process.env.PLAID_DEV_SECRET_KEY,
    PLAID_PROD_SECRET_EXISTS: !!process.env.PLAID_PROD_SECRET_KEY,
    PLAID_SECRET_EXISTS: !!PLAID_SECRET,
    NEXT_PUBLIC_DOMAIN_EXISTS: !!process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_DOMAIN_VALUE: isProd ? '[hidden in production]' : process.env.NEXT_PUBLIC_DOMAIN,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    VERCEL_URL_EXISTS: !!process.env.VERCEL_URL,
    VERCEL_URL: isProd ? '[hidden in production]' : process.env.VERCEL_URL
  };

  // Check for Plaid session
  const accessToken = req.cookies.plaid_access_token;
  const itemId = req.cookies.plaid_item_id;
  let hasValidSession = false;
  let sessionMessage = 'No Plaid session found';

  if (accessToken && itemId) {
    try {
      // Validate the access token by making a test API call
      await plaidClient.itemGet({
        access_token: accessToken
      });
      hasValidSession = true;
      sessionMessage = 'Valid Plaid session found';
    } catch (error) {
      console.error('Error validating Plaid session:', error);
      hasValidSession = false;
      sessionMessage = 'Invalid Plaid session';
    }
  }

  let activeSecretKey = 'none';
  if (PLAID_ENV === 'production' && process.env.PLAID_PROD_SECRET_KEY) {
    activeSecretKey = 'PLAID_PROD_SECRET_KEY';
  } else if (PLAID_ENV === 'development' && process.env.PLAID_DEV_SECRET_KEY) {
    activeSecretKey = 'PLAID_DEV_SECRET_KEY';
  } else if (process.env.PLAID_SANDBOX_SECRET_KEY) {
    activeSecretKey = 'PLAID_SANDBOX_SECRET_KEY';
  }

  const sessionOnly = req.query.sessionOnly === 'true';
  if (sessionOnly) {
    return res.status(200).json({
      success: true,
      hasValidSession,
      message: sessionMessage
    });
  }

  // Otherwise return full environment check
  return res.status(200).json({
    success: true,
    hasValidSession,
    message: sessionMessage,
    environment: {
      ...envCheck,
      active_secret_key: activeSecretKey
    },
    missingVariables: Object.entries(envCheck)
      .filter(([key, value]) => key.endsWith('_EXISTS') && !value)
      .map(([key]) => key.replace('_EXISTS', ''))
  });
} 