import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SANDBOX_SECRET_KEY,
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
