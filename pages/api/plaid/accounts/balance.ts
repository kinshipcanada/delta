import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { AxiosError } from 'axios';

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
  try {
    // In a production app, you would retrieve the access_token from your database
    const access_token = process.env.PLAID_ACCESS_TOKEN;
    
    if (!access_token) {
      return res.status(400).json({ 
        error: 'No access token available',
        message: 'Please link a bank account first to fetch account balances' 
      });
    }

    const response = await plaidClient.accountsBalanceGet({
      access_token: access_token,
    });

    const accounts = response.data.accounts;
    
    // Format the accounts for display
    const formattedAccounts = accounts.map(account => ({
      id: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype || 'N/A',
      mask: account.mask || 'N/A',
      balance: {
        current: account.balances.current,
        available: account.balances.available,
        limit: account.balances.limit,
        currencyCode: account.balances.iso_currency_code
      }
    }));

    return res.status(200).json({
      success: true,
      accounts: formattedAccounts
    });
  } catch (error: unknown) {
    console.error('Error fetching account balances:', error);
    
    const axiosError = error as AxiosError;
    const plaidError = axiosError.response?.data || {};
    
    return res.status(500).json({
      error: 'Failed to fetch account balances',
      details: error instanceof Error ? error.message : 'Unknown error',
      plaidError
    });
  }
} 