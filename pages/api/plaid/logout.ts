import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// Select the appropriate secret key based on environment
let PLAID_SECRET: string | undefined;
if (PLAID_ENV === 'production') {
  PLAID_SECRET = process.env.PLAID_PROD_SECRET_KEY;
} else if (PLAID_ENV === 'development') {
  PLAID_SECRET = process.env.PLAID_DEV_SECRET_KEY;
} else {
  PLAID_SECRET = process.env.PLAID_SANDBOX_SECRET_KEY;
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = req.cookies.plaid_access_token;
    
    if (accessToken) {
      try {
        // Call the Plaid API to revoke the access token
        await plaidClient.itemRemove({
          access_token: accessToken,
        });
      } catch (plaidError) {
        console.error('Error removing Plaid item:', plaidError);
        // Continue with cookie removal even if Plaid API call fails
      }
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
    // Still try to clear cookies even if there's an error
    res.setHeader(
      'Set-Cookie', 
      [
        'plaid_access_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        'plaid_item_id=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
      ]
    );
    res.status(200).json({ success: true, warning: 'Cookies cleared but encountered an error with Plaid' });
  }
}