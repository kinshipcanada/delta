import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';
import { AxiosError } from 'axios';

// Coming from the client, create a new configuration object for the Plaid API
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SANDBOX_SECRET_KEY,
    },
  },
});

// Create a new Plaid client using the configuration
const plaidClient = new PlaidApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Hard-coded valid Plaid products and country codes
    const products = ['auth', 'transactions'] as Products[];
    const countryCodes = ['CA'] as CountryCode[]; // You can add 'US' if needed

    console.log("Creating link token with:", {
      products,
      countryCodes,
      webhookUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/api/plaid/webhook`
    });

    const tokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: 'kinship-admin'
      },
      client_name: 'Kinship Canada',
      products: products,
      transactions: {
        days_requested: 730 // Maximum allowed value
      },
      country_codes: countryCodes,
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_DOMAIN}/api/plaid/webhook`,
    });

    console.log("Link token created successfully");
    res.json({ link_token: tokenResponse.data.link_token });
  } catch (error: unknown) {
    console.error('Error creating link token:', error);
    
    // Get more details from the error if available
    const axiosError = error as AxiosError;
    const plaidError = axiosError.response?.data || {};
    
    res.status(500).json({ 
      error: 'Failed to create link token',
      details: error instanceof Error ? error.message : 'Unknown error',
      plaidError
    });
  }
} 