import { useEffect, useState } from 'react';
import { supabase } from '@lib/utils/helpers';
import { region_enum } from '@prisma/client';
import Link from 'next/link';

interface Donation {
  id: string;
  status: string;
  date: string;
  donor_name: string;
  email: string;
  amount_donated_cents: number;
  amount_charged_cents: number;
  line_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface Distribution {
  id: string;
  amount_cents: number;
  tag: string | null;
  partner_name: string | null;
  date_of_distribution: string;
  donation_distribution: DonationDistribution[];
}

interface Cause {
  id: string;
  donation_id: string;
  region: region_enum;
  amount_cents: number;
  in_honor_of: string | null;
  cause: string;
  subcause: string | null;
}

interface DonationDistribution {
  id: string;
  donation_id: string;
  distribution_id: string;
  cause_id: string;
  amount_cents: number | null;
  donation: Donation;
  cause: Cause;
}

interface ApiResponse {
  success: boolean;
  data?: {
    donations: Donation[];
    distributions: Distribution[];
    donationDistributions: DonationDistribution[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export default function DistributionDashboard() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching distributions...');
      
      const response = await fetch(`/api/v2/database/connecting?page=${page}&limit=10`);
      const result = await response.json() as ApiResponse;

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setDistributions(result.data.distributions);
      setTotalPages(result.data.pagination.totalPages);
      setCurrentPage(page);
      console.log('Distributions loaded:', result.data.distributions.length);

    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateLetterData = (distribution: Distribution) => {
    // Group causes by region
    const groupedCauses = distribution.donation_distribution.reduce((acc: Record<string, any>, dd) => {
      const key = dd.cause.region;
      if (!acc[key]) {
        acc[key] = {
          partner: distribution.partner_name || 'Unnamed Partner',
          region: dd.cause.region,
          causes: [],
          totalAmount: '0'
        };
      }
      
      acc[key].causes.push({
        cause: dd.cause.cause,
        amount: ((dd.amount_cents || 0) / 100).toFixed(2)
      });
      
      const currentTotal = parseFloat(acc[key].totalAmount);
      acc[key].totalAmount = (currentTotal + ((dd.amount_cents || 0) / 100)).toFixed(2);
      
      return acc;
    }, {});

    return {
      institutionName: distribution.partner_name || 'Unnamed Partner',
      recipientName: '', // This can be customized if needed
      date: new Date(distribution.date_of_distribution).toLocaleDateString(),
      reference: distribution.tag || distribution.id,
      totalAmount: (distribution.amount_cents / 100).toFixed(2),
      partnerGroups: Object.values(groupedCauses)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Distribution Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">View and manage distributions</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Distribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {distributions.map((distribution) => (
            <div 
              key={distribution.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex flex-col gap-3 mb-4">
                {distribution.tag && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 self-start">
                    {distribution.tag}
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {distribution.partner_name || 'Unnamed Distribution'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(distribution.date_of_distribution).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">
                  ${(distribution.amount_cents / 100).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {distribution.donation_distribution.length} donation{distribution.donation_distribution.length !== 1 ? 's' : ''} allocated
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/admin/goals/${distribution.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
