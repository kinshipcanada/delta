import { NextApiRequest, NextApiResponse } from "next";
import { DonationEngine } from "../../../lib/methods/donations";
import { createServerClient } from '@supabase/ssr';
import prisma from "../../../lib/prisma";
import { Prisma, PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client first
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies[name],
          set: (name, value, options) => {
            res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict`);
          },
          remove: (name) => {
            res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
          },
        },
      }
    );

    // Validate both Plaid and Auth sessions
    const plaidAccessToken = req.cookies.plaid_access_token;
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Handle session validation failures with detailed errors
    if (!plaidAccessToken) {
      console.error('No Plaid session found in cookies');
      return res.status(401).json({ 
        error: 'Plaid session expired',
        code: 'PLAID_SESSION_EXPIRED',
        details: 'Please log in again to refresh your Plaid session'
      });
    }

    if (sessionError) {
      console.error('Supabase auth error:', sessionError);
      return res.status(401).json({ 
        error: 'Authentication session error',
        code: 'AUTH_SESSION_ERROR',
        details: sessionError.message
      });
    }

    if (!session) {
      console.error('No Supabase session found');
      return res.status(401).json({ 
        error: 'Authentication session expired',
        code: 'AUTH_SESSION_EXPIRED',
        details: 'Please log in again to refresh your session'
      });
    }

    // Verify the user has admin access
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!userRoles || userRoles.role !== 'admin') {
      console.error('User does not have admin access');
      return res.status(403).json({
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED',
        details: 'You do not have permission to perform this action'
      });
    }

    const { donationData, causesData } = req.body;
    if (!donationData || !causesData) {
      return res.status(400).json({ 
        error: 'Missing required data',
        code: 'INVALID_REQUEST',
        details: 'Both donationData and causesData are required'
      });
    }

    // Initialize donation engine and process the donation
    const donationEngine = new DonationEngine();

    // Check distribution capacity first
    const capacityCheck = await donationEngine.checkDistributionCapacity(donationData, causesData);
    if (!capacityCheck.success) {
      return res.status(400).json({ 
        error: capacityCheck.error || 'Distribution capacity exceeded',
        code: 'CAPACITY_EXCEEDED',
        details: 'The requested distribution exceeds available capacity'
      });
    }

    // Process the donation
    try {
      const donation = await prisma.$transaction(async (prismaTransaction: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
        // Save the donation
        const savedDonation = await donationEngine.insertDonationObject(donationData);
        
        // Save causes
        for (const cause of causesData) {
          await donationEngine.saveCauseForDonation(savedDonation.id, cause);
        }
        
        // Save distributions
        await donationEngine.saveDistributionForDonation(savedDonation, causesData, prismaTransaction);
        
        return savedDonation;
      });

      return res.status(200).json({ 
        success: true,
        data: donation 
      });
    } catch (error) {
      console.error('Error processing donation:', error);
      if (error instanceof Error && error.message.includes('duplicate')) {
        return res.status(400).json({ 
          error: 'This donation has already been processed',
          code: 'DUPLICATE_DONATION',
          details: 'A donation with this ID already exists in the system'
        });
      }
      throw error; // Let the outer catch handle other errors
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred while processing the donation',
      code: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 