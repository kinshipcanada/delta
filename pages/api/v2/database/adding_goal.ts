import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@lib/utils/helpers';
import { region_enum } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface GoalData {
  distribution_title: string;
  goal_amount: string | number;
  region: region_enum;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { distribution_title, goal_amount, region } = req.body as GoalData;

    // Validate input
    if (!distribution_title || !region) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert goal_amount to number if it's a string, or default to 0
    const goalAmountNumber = goal_amount ? (typeof goal_amount === 'string' ? parseFloat(goal_amount) : goal_amount) : 0;

    // Insert new goal with generated UUID
    const { data, error } = await supabase
      .from('goals')
      .insert([
        {
          id: uuidv4(), // Generate a new UUID for the id field
          distribution_title,
          goal_amount: goalAmountNumber,
          region,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return res.status(200).json({
      success: true,
      data
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
