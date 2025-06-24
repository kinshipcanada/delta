import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // First try exact match
    let donor = await prisma.donation.findFirst({
      where: {
        donor_name: name
      },
      orderBy: {
        date: 'desc'
      }
    });

    // If no exact match, try case-insensitive match
    if (!donor) {
      donor = await prisma.donation.findFirst({
        where: {
          donor_name: {
            contains: name,
            mode: 'insensitive'
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    }

    // If still no match, try matching parts of the name
    if (!donor) {
      const nameParts = name.split(' ');
      const nameQueries = nameParts.map((part: string) => ({
        donor_name: {
          contains: part,
          mode: 'insensitive'
        }
      }));

      donor = await prisma.donation.findFirst({
        where: {
          OR: nameQueries
        },
        orderBy: {
          date: 'desc'
        }
      });
    }

    return res.status(200).json({ donor });
  } catch (error) {
    console.error('Error looking up donor:', error);
    return res.status(500).json({ error: 'Failed to lookup donor' });
  }
} 