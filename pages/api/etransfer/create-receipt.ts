import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/prisma';
import { NotificationEngine } from '@lib/methods/notifications';
import { status_enum } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      transactionId,
      amount,
      donorName,
      email,
      lineAddress,
      city,
      state,
      country,
      postalCode,
      date,
      causes = []
    } = req.body;

    // Validate required fields
    if (!transactionId || !amount || !donorName || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: transactionId, amount, donorName, email' 
      });
    }

    // Check if donation already exists
    const existingDonation = await prisma.donation.findUnique({
      where: { id: transactionId }
    });

    if (existingDonation) {
      return res.status(400).json({ 
        error: 'Receipt already exists for this transaction' 
      });
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        id: transactionId,
        amount_charged_cents: Math.round(amount * 100),
        amount_donated_cents: Math.round(amount * 100),
        donor_name: donorName,
        email: email,
        status: status_enum.DELIVERED_TO_PARTNERS, // Mark as ready for receipt
        date: date ? new Date(date) : new Date(),
        line_address: lineAddress || '',
        city: city || '',
        state: state || '',
        country: country || 'CA',
        postal_code: postalCode || '',
        stripe_customer_id: null,
        stripe_transfer_id: null,
        stripe_charge_id: null,
        fee_charged_by_processor: 0,
        fees_covered_by_donor: 0,
        version: 2
      }
    });

    // Create cause records if provided
    if (causes && causes.length > 0) {
      const { v4: uuidv4 } = require('uuid');
      for (const cause of causes) {
        if (cause.causeId && cause.amount) {
          await prisma.cause.create({
            data: {
              id: uuidv4(),
              donation_id: donation.id,
              cause: cause.name || 'General Donation',
              region: cause.region || null,
              amount_cents: Math.round(cause.amount * 100)
            }
          });
        }
      }
    }

    // Send receipt email
    const notificationEngine = new NotificationEngine();
    await notificationEngine.emailDonationReceipt(donation, {});

    return res.status(200).json({
      success: true,
      donation: donation,
      receiptUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.id}`
    });

  } catch (error) {
    console.error('Error creating e-transfer receipt:', error);
    return res.status(500).json({ 
      error: 'Failed to create receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 