import { useEffect, useState } from 'react';
import { supabase } from '@lib/utils/helpers';
import { region_enum } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@components/prebuilts/Authentication';
import { Button, ButtonStyle } from '@components/primitives';

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
  transaction_date: string;
  donation_distribution: DonationDistribution[];
  cause?: string;
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
    distributions: Distribution[];
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
  const router = useRouter();
  const { donor } = useAuth();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkPlaidSession = async () => {
      try {
        const response = await fetch('/api/plaid/check-env?sessionOnly=true');
        const data = await response.json();
        
        if (!data.success || !data.hasValidSession) {
          router.push('/admin/login');
          return;
        }
        
        fetchData();
      } catch (err) {
        console.error('Error checking Plaid session:', err);
        router.push('/admin/login');
      }
    };

    checkPlaidSession();
  }, [currentPage, router]);

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('Fetching distributions...');
      
      const apiUrl = `/api/v2/database/connecting?page=${page}&limit=10`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let result: ApiResponse;
      try {
        result = JSON.parse(responseText) as ApiResponse;
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error(`Failed to parse API response: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(result.error || `API returned status ${response.status}`);
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      console.log('API response data:', result.data);
      
      setDistributions(result.data.distributions);
      setTotalPages(result.data.pagination.totalPages);
      setCurrentPage(page);
      console.log('Distributions loaded:', result.data.distributions.length);

    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      
      // Store debug info for troubleshooting
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.toString() : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchData(newPage);
    }
  };

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
      date: new Date(distribution.transaction_date).toLocaleDateString(),
      reference: distribution.tag || distribution.id,
      totalAmount: (distribution.amount_cents / 100).toFixed(2),
      partnerGroups: Object.values(groupedCauses)
    };
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/plaid/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout error:', await response.json());
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleRetry = () => {
    fetchData(currentPage);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Distribution Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">View and manage distributions</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/admin/donations')}
              text="e-Transfers and Wires"
              style={ButtonStyle.Secondary}
            />
            <Button
              onClick={handleLogout}
              text="Logout"
              style={ButtonStyle.Secondary}
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={handleRetry}
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Retry
              </button>
            </div>
            {debugInfo && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer">Debug Information</summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Distribution Cards */}
        {distributions.length > 0 ? (
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
                      {distribution.cause || distribution.partner_name || 'Unnamed Distribution'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {distribution.partner_name && distribution.cause ? `Partner: ${distribution.partner_name}` : ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(distribution.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${(distribution.amount_cents / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {distribution.donation_distribution?.length || 0} donation{(distribution.donation_distribution?.length || 0) !== 1 ? 's' : ''} allocated
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
        ) : !error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No distributions found</p>
          </div>
        ) : null}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md mr-2 bg-white border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md ml-2 bg-white border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
