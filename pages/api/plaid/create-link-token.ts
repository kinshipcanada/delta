import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';
import { AxiosError } from 'axios';

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

// Log configuration at startup
console.log("Plaid API Configuration:", {
  env: PLAID_ENV,
  clientIdExists: !!PLAID_CLIENT_ID,
  secretExists: !!PLAID_SECRET
});

// Coming from the client, create a new configuration object for the Plaid API
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

// Create a new Plaid client using the configuration
const plaidClient = new PlaidApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    // Check if environment variables are set
    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      console.error("Missing Plaid credentials:", {
        clientIdExists: !!PLAID_CLIENT_ID,
        secretExists: !!PLAID_SECRET
      });
      return res.status(500).json({
        success: false,
        error: 'Missing Plaid credentials',
        details: 'The server is missing required Plaid API credentials'
      });
    }

    // Log environment variables (without exposing secrets)
    console.log("Environment check:", {
      PLAID_ENV: PLAID_ENV,
      PLAID_CLIENT_ID_EXISTS: !!PLAID_CLIENT_ID,
      PLAID_SECRET_EXISTS: !!PLAID_SECRET,
      NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    });

    // Only request products that your Plaid account has access to
    // Removing 'auth' since your account doesn't have access to it
    const products = ['transactions'] as Products[];
    const countryCodes = ['CA'] as CountryCode[]; // You can add 'US' if needed
    
    const webhookUrl = process.env.NEXT_PUBLIC_DOMAIN 
      ? `${process.env.NEXT_PUBLIC_DOMAIN}/api/plaid/webhook` 
      : undefined;

    console.log("Creating link token with:", {
      products,
      countryCodes,
      webhookUrl,
      clientName: 'Kinship Canada',
      clientUserId: 'kinship-admin'
    });

    const createRequest = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      user: {
        client_user_id: 'kinship-admin'
      },
      client_name: 'Kinship Canada',
      products: products,
      country_codes: countryCodes,
      language: 'en',
    };
    
    // Only add webhook if it's defined
    if (webhookUrl) {
      Object.assign(createRequest, { webhook: webhookUrl });
    }
    
    // Only add transactions if needed
    if (products.includes('transactions' as Products)) {
      Object.assign(createRequest, { 
        transactions: {
          days_requested: 730
        }
      });
    }

    console.log("Link token request payload (sanitized):", JSON.stringify({
      ...createRequest,
      client_id: "REDACTED",
      secret: "REDACTED"
    }, null, 2));
    
    const tokenResponse = await plaidClient.linkTokenCreate(createRequest);

    console.log("Link token created successfully");
    res.json({ 
      success: true,
      link_token: tokenResponse.data.link_token 
    });
  } catch (error: unknown) {
    console.error('Error creating link token:', error);
    
    // Get more details from the error if available
    const axiosError = error as AxiosError;
    let errorDetails = 'Unknown error';
    let plaidError: Record<string, unknown> = {};
    
    if (axiosError.response) {
      console.error('Plaid API response error:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data
      });
      plaidError = axiosError.response.data as Record<string, unknown>;
      errorDetails = JSON.stringify(axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received from Plaid API:', axiosError.request);
      errorDetails = 'No response received from Plaid API';
    } else if (error instanceof Error) {
      console.error('Error message:', error.message);
      errorDetails = error.message;
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to create link token',
      details: errorDetails,
      plaidError
    });
  }
} 