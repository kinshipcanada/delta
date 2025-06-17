import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { AxiosError } from 'axios';
import prisma from '@lib/prisma';

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
  try {
    // In a production app, you would retrieve the access_token from your database
    // For example: const { access_token } = await prisma.plaidCredentials.findFirst();
    
    // For now, we'll use the access token from environment variables or mock data for demo
    const access_token = process.env.PLAID_ACCESS_TOKEN;
    
    if (!access_token) {
      return res.status(400).json({ 
        error: 'No access token available',
        message: 'Please link a bank account first to fetch transactions' 
      });
    }

    // Get transactions for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const response = await plaidClient.transactionsSync({
      access_token: access_token,
      options: {
        include_personal_finance_category: true
      }
    });

    const transactions = response.data.added;
    
    // Format the transactions for display
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.transaction_id,
      date: transaction.date,
      name: transaction.name,
      amount: transaction.amount,
      category: transaction.personal_finance_category?.primary || 'Uncategorized',
      pending: transaction.pending,
      accountId: transaction.account_id
    }));

    return res.status(200).json({
      success: true,
      transactions: formattedTransactions
    });
  } catch (error: unknown) {
    console.error('Error fetching transactions:', error);
    
    const axiosError = error as AxiosError;
    const plaidError = axiosError.response?.data || {};
    
    return res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error instanceof Error ? error.message : 'Unknown error',
      plaidError
    });
  }
} 