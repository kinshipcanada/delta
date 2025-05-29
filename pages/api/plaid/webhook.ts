import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { NotificationEngine } from '@lib/methods/notifications';
import prisma from '@lib/prisma';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
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

  const { webhook_type, webhook_code, item_id } = req.body;

  // Handle new transactions
  if (webhook_type === 'TRANSACTIONS' && webhook_code === 'DEFAULT_UPDATE') {
    try {
      // Get new transactions
      const response = await plaidClient.transactionsSync({
        access_token: process.env.PLAID_ACCESS_TOKEN!,
      });

      const newTransactions = response.data.added;

      // Process each new transaction
      for (const transaction of newTransactions) {
        // Look for e-transfers (you'll need to adjust this logic based on how e-transfers appear in your bank feed)
        if (transaction.name.toLowerCase().includes('e-transfer')) {
          // Create donation record
          const donation = await prisma.donation.create({
            data: {
              id: transaction.transaction_id, // Use transaction ID as unique identifier
              amount_charged_cents: Math.round(transaction.amount * 100), // Convert to cents
              amount_donated_cents: Math.round(transaction.amount * 100), // Same as charged amount for e-transfers
              donor_name: transaction.name,
              email: '', // You'll need to determine how to get this
              status: "PROCESSING",
              date: new Date(transaction.date),
              // Required address fields
              line_address: 'Unknown',
              city: 'Unknown',
              state: 'Unknown',
              country: 'CA', // Default to Canada
              postal_code: 'Unknown',
              // Optional fields can be null
              stripe_customer_id: null,
              stripe_transfer_id: null,
              stripe_charge_id: null,
              fee_charged_by_processor: 0,
              fees_covered_by_donor: 0,
              version: 2
            },
          });

          // Send notification
          const notificationEngine = new NotificationEngine();
          await notificationEngine.emailDonationReceipt(donation, {});
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error processing transactions:', error);
      res.status(500).json({ error: 'Failed to process transactions' });
    }
  }

  // Handle other webhook types as needed
  res.status(200).json({ received: true });
} 