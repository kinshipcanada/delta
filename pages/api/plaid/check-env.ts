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
    PLAID_SECRET_EXISTS: !!(process.env.PLAID_SECRET || process.env.PLAID_SANDBOX_SECRET_KEY),
    NEXT_PUBLIC_DOMAIN_EXISTS: !!process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_DOMAIN_VALUE: isProd ? '[hidden in production]' : process.env.NEXT_PUBLIC_DOMAIN,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    VERCEL_URL_EXISTS: !!process.env.VERCEL_URL,
    VERCEL_URL: isProd ? '[hidden in production]' : process.env.VERCEL_URL
  };

  res.status(200).json({
    success: true,
    environment: envCheck,
    missingVariables: Object.entries(envCheck)
      .filter(([key, value]) => key.endsWith('_EXISTS') && !value)
      .map(([key]) => key.replace('_EXISTS', ''))
  });
} 