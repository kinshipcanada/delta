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

    // For demo purposes, we'll log the access token - in production, you should save it securely
    console.log("Access Token:", ACCESS_TOKEN);
    console.log("Item ID:", ITEM_ID);
    
    // Hacky way to make access token available for demo purposes
    // In production, you would store this in a database
    process.env.PLAID_ACCESS_TOKEN = ACCESS_TOKEN;

    // TODO: Store these tokens securely in your database
    // For example:
    // await prisma.plaidCredentials.create({
    //   data: {
    //     accessToken: ACCESS_TOKEN,
    //     itemId: ITEM_ID,
    //     // You might want to add additional fields like:
    //     // dateLinked: new Date(),
    //     // status: 'active'
    //   }
    // });

    // Only return success status to the client, not the sensitive tokens
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
