import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = req.cookies.plaid_access_token;
    
    if (accessToken) {
      // Call the Plaid API to revoke the access token
      await plaidClient.itemRemove({
        access_token: accessToken,
      });
    }

    // Clear the Plaid cookies
    res.setHeader(
      'Set-Cookie', 
      [
        'plaid_access_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        'plaid_item_id=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
      ]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging out from Plaid:', error);
    res.status(500).json({ error: 'Failed to log out from Plaid' });
  }
}