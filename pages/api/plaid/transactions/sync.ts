import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the access token from the cookie
    const accessToken = req.cookies.plaid_access_token;
    if (!accessToken) {
      console.log('No access token found in cookies');
      return res.status(400).json({ error: 'No access token found' });
    }

    // Initialize Plaid client with proper configuration
    const config = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_ENV === 'production' 
            ? process.env.PLAID_PROD_SECRET_KEY
            : process.env.PLAID_ENV === 'development'
            ? process.env.PLAID_DEV_SECRET_KEY
            : process.env.PLAID_SANDBOX_SECRET_KEY,
        },
      },
    });

    const client = new PlaidApi(config);

    // Use the sync endpoint with cursor-based pagination
    const request = {
      access_token: accessToken,
      options: {
        include_personal_finance_category: true
      }
    };

    const response = await client.transactionsSync(request);
    
    // Get all added transactions
    const transactions = response.data.added || [];

    // Format transactions for the frontend
    const formattedTransactions = transactions
      .filter(transaction => transaction.date) // Ensure transaction has a date
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
      .map(transaction => ({
        id: transaction.transaction_id,
        date: transaction.date,
        name: transaction.name,
        amount: transaction.amount,
        category: transaction.personal_finance_category?.primary || transaction.category?.[0] || 'Uncategorized',
        description: transaction.original_description || '', // Use original_description for e-transfer messages
        paymentChannel: transaction.payment_channel || '',
        merchantName: transaction.merchant_name || '',
        paymentInfo: {
          byOrderOf: transaction.payment_meta?.by_order_of,
          payee: transaction.payment_meta?.payee,
          payer: transaction.payment_meta?.payer,
          method: transaction.payment_meta?.payment_method,
          processor: transaction.payment_meta?.payment_processor,
          reason: transaction.payment_meta?.reason,
          reference: transaction.payment_meta?.reference_number
        }
      }));

    return res.status(200).json({
      success: true,
      transactions: formattedTransactions,
      has_more: response.data.has_more,
      next_cursor: response.data.next_cursor
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 