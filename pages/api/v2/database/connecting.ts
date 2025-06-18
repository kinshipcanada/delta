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
    // Fetch distributions
    const { data: distributions, error: distributionsError } = await supabase
      .from('distribution')
      .select('*')
      .order('date', { ascending: false });

    if (distributionsError) {
      console.error('Database error (distributions):', distributionsError);
      throw distributionsError;
    }

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (goalsError) {
      console.error('Database error (goals):', goalsError);
      throw goalsError;
    }

    // Return success response with both datasets
    return res.status(200).json({
      success: true,
      data: {
        distributions: distributions || [],
        goals: goals || []
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
