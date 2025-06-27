import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@lib/classes/api';
import prisma from '../../../../../lib/prisma';

// Helper function to handle BigInt serialization
function serializeBigInt(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'bigint') {
    return Number(data); // Convert BigInt to Number (safe for amounts in cents)
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }
  
  if (typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }
  
  return data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('API called with params:', req.query);
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Missing or invalid distribution ID' 
      });
    }

    // Check for Plaid session
    const accessToken = req.cookies.plaid_access_token;
    const itemId = req.cookies.plaid_item_id;
    
    console.log('Plaid auth check:', accessToken ? 'Access token exists' : 'No access token');
    
    if (!accessToken || !itemId) {
      console.log('No Plaid session found');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // User is authenticated via Plaid, proceed with database query using Prisma
    console.log(`Valid Plaid session found, fetching distribution details for ID: ${id}`);
    
    try {
      // Fetch the distribution with its related donation_distributions
      const distribution = await prisma.distribution.findUnique({
        where: {
          id: id
        },
        include: {
          donation_distribution: {
            include: {
              donation: true,
              cause: true
            }
          }
        }
      });
      
      if (!distribution) {
        return res.status(404).json({
          success: false,
          error: 'Distribution not found'
        });
      }
      
      console.log(`Retrieved distribution with ${distribution.donation_distribution.length} donation distributions`);
      
      // Format the response data
      const formattedDistribution = {
        ...distribution,
        transaction_date: distribution.transaction_date.toISOString(),
        cause: distribution.cause || null,
        donation_distribution: distribution.donation_distribution.map(dd => ({
          ...dd,
          donation: {
            ...dd.donation,
            date: dd.donation.date.toISOString()
          }
        }))
      };
      
      // Serialize BigInt values before sending the response
      const serializedData = serializeBigInt(formattedDistribution);
      
      return res.status(200).json({
        success: true,
        data: serializedData
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 