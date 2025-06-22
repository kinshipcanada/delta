import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@lib/utils/helpers';
import { ApiResponse } from '@lib/classes/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Fetch total count of donations
    const { count: totalCount, error: countError } = await supabase
      .from('donation')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Database error (count):', countError);
      throw countError;
    }

    if (totalCount === null) {
      throw new Error('Failed to get total count of donations');
    }

    // Fetch paginated donations
    const { data: donations, error: donationsError } = await supabase
      .from('donation')
      .select('*')
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (donationsError) {
      console.error('Database error (donations):', donationsError);
      throw donationsError;
    }

    // Fetch distributions
    const { data: distributions, error: distributionsError } = await supabase
      .from('distribution')
      .select(`
        *,
        donation_distribution (
          id,
          donation_id,
          cause_id,
          amount_cents,
          donation:donation_id (*),
          cause:cause_id (*)
        )
      `);

    if (distributionsError) {
      console.error('Database error (distributions):', distributionsError);
      throw distributionsError;
    }

    // Fetch donation_distributions separately to get all donation allocations
    const { data: donationDistributions, error: donationDistributionsError } = await supabase
      .from('donation_distribution')
      .select(`
        *,
        donation:donation_id (*),
        distribution:distribution_id (*),
        cause:cause_id (*)
      `);

    if (donationDistributionsError) {
      console.error('Database error (donation_distributions):', donationDistributionsError);
      throw donationDistributionsError;
    }

    // Return success response with all datasets and pagination info
    return res.status(200).json({
      success: true,
      data: {
        donations: donations || [],
        distributions: distributions || [],
        donationDistributions: donationDistributions || [],
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      if (error.message.includes('permission denied')) {
        statusCode = 403;
        errorMessage = 'Database permission denied. Please check table permissions for the anon role.';
      } else {
        errorMessage = error.message;
      }
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
}
