import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionId } = req.query;

    if (!transactionId || typeof transactionId !== 'string') {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    // Check if donation exists
    const existingDonation = await prisma.donation.findUnique({
      where: { id: transactionId }
    });

    return res.status(200).json({
      exists: !!existingDonation,
      donation: existingDonation ? {
        id: existingDonation.id,
        donor_name: existingDonation.donor_name,
        email: existingDonation.email,
        amount: existingDonation.amount_charged_cents / 100,
        status: existingDonation.status
      } : null
    });

  } catch (error) {
    console.error('Error checking receipt:', error);
    return res.status(500).json({ 
      error: 'Failed to check receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 