import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// Get environment variables
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// Select the appropriate secret key based on environment
let PLAID_SECRET: string | undefined;
if (PLAID_ENV === 'production') {
  PLAID_SECRET = process.env.PLAID_PROD_SECRET_KEY;
} else if (PLAID_ENV === 'development') {
  PLAID_SECRET = process.env.PLAID_DEV_SECRET_KEY;
} else {
  // Default to sandbox
  PLAID_SECRET = process.env.PLAID_SECRET || process.env.PLAID_SANDBOX_SECRET_KEY;
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { public_token } = req.body;

    // Exchange the public token for an access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token
    });

    // Get the access token and item ID from the response
    const ACCESS_TOKEN = tokenResponse.data.access_token;
    const ITEM_ID = tokenResponse.data.item_id;

    // Store the access token in an HTTP-only cookie
    // Set cookie to expire in 30 days
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    res.setHeader(
      'Set-Cookie', 
      [
        `plaid_access_token=${ACCESS_TOKEN}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${thirtyDays}`,
        `plaid_item_id=${ITEM_ID}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${thirtyDays}`
      ]
    );

    return res.json({
      success: true,
      message: 'Bank account successfully linked'
    });

  } catch (error) {
    console.error('Error exchanging public token:', error);
    return res.status(500).json({ 
      error: 'Failed to link bank account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}