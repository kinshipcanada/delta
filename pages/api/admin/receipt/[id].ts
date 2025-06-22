import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { createServerClient } from '@supabase/ssr';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create Supabase client for authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies[name],
          set: () => {}, // Not needed for API routes
          remove: () => {}, // Not needed for API routes
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Add admin role check here if you have role-based access control
    // For now, any authenticated user can access (you can restrict this later)

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Receipt ID is required' });
    }

    // Fetch the donation from the database (no email restriction for admin)
    const donation = await prisma.donation.findFirst({
      where: {
        OR: [
          { id },
          { stripe_charge_id: id }
        ]
      }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    return res.status(200).json({
      success: true,
      donation: donation
    });

  } catch (error) {
    console.error('Error fetching admin receipt:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 