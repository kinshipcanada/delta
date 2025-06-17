import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // We'll allow this in all environments but hide sensitive values in production
  const isProd = process.env.NODE_ENV === 'production';
  
  const envCheck = {
    PLAID_ENV: process.env.PLAID_ENV || 'sandbox',
    PLAID_CLIENT_ID_EXISTS: !!process.env.PLAID_CLIENT_ID,
    PLAID_SANDBOX_SECRET_EXISTS: !!process.env.PLAID_SANDBOX_SECRET_KEY,
    PLAID_DEV_SECRET_EXISTS: !!process.env.PLAID_DEV_SECRET_KEY,
    PLAID_PROD_SECRET_EXISTS: !!process.env.PLAID_PROD_SECRET_KEY,
    PLAID_SECRET_EXISTS: !!process.env.PLAID_SECRET,
    NEXT_PUBLIC_DOMAIN_EXISTS: !!process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_DOMAIN_VALUE: isProd ? '[hidden in production]' : process.env.NEXT_PUBLIC_DOMAIN,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    VERCEL_URL_EXISTS: !!process.env.VERCEL_URL,
    VERCEL_URL: isProd ? '[hidden in production]' : process.env.VERCEL_URL
  };

  // Determine which secret key is active based on the environment
  let activeSecretKey = 'none';
  if (process.env.PLAID_ENV === 'production' && process.env.PLAID_PROD_SECRET_KEY) {
    activeSecretKey = 'PLAID_PROD_SECRET_KEY';
  } else if (process.env.PLAID_ENV === 'development' && process.env.PLAID_DEV_SECRET_KEY) {
    activeSecretKey = 'PLAID_DEV_SECRET_KEY';
  } else if (process.env.PLAID_SANDBOX_SECRET_KEY) {
    activeSecretKey = 'PLAID_SANDBOX_SECRET_KEY';
  } else if (process.env.PLAID_SECRET) {
    activeSecretKey = 'PLAID_SECRET';
  }

  res.status(200).json({
    success: true,
    environment: {
      ...envCheck,
      active_secret_key: activeSecretKey
    },
    missingVariables: Object.entries(envCheck)
      .filter(([key, value]) => key.endsWith('_EXISTS') && !value)
      .map(([key]) => key.replace('_EXISTS', ''))
  });
} 