import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Distribution {
  id: string;
  amount_cents: number;
  tag: string | null;
  partner_name: string | null;
  transaction_date: string;
  donation_distribution: DonationDistribution[];
}

interface DonationDistribution {
  donation_id: string;
  distribution_id: string;
  cause_id: string;
  amount_cents: number | null;
  donation: Donation;
  cause: Cause;
}

interface Donation {
  id: string;
  donor_name: string;
  email: string;
  amount_donated_cents: number;
  date: string;
}

interface Cause {
  id: string;
  cause: string;
  region: string | null;
  amount_cents: number;
}

export default function DistributionDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkPlaidSession = async () => {
    try {
      const response = await fetch('/api/plaid/check-env');
      const data = await response.json();
      
      if (!data.success || !data.hasValidSession) {
        console.log('No valid Plaid session found, redirecting to login');
        router.push('/admin/login');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error checking Plaid session:', err);
      router.push('/admin/login');
      return false;
    }
  };

  const fetchDistributionDetails = async () => {
    if (!id) return;

    try {
      // Use API endpoint instead of direct Supabase query
      const response = await fetch(`/api/v2/database/distribution/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch distribution details');
      }
      
      setDistribution(data.data);
    } catch (err) {
      console.error('Error fetching distribution details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch distribution details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      const hasValidSession = await checkPlaidSession();
      if (hasValidSession && id) {
        fetchDistributionDetails();
      }
    };

    initializePage();
  }, [id, router]);

  const generateLetterData = (distribution: Distribution) => {
    // Group causes by region
    const groupedCauses = distribution.donation_distribution.reduce((acc: Record<string, any>, dd) => {
      const regionKey = dd.cause.region || 'Unspecified Region';
      if (!acc[regionKey]) {
        acc[regionKey] = {
          partner: distribution.partner_name || 'Unnamed Partner',
          region: dd.cause.region || 'Unspecified Region',
          causes: [],
          totalAmount: '0'
        };
      }
      
      acc[regionKey].causes.push({
        cause: dd.cause.cause,
        amount: ((dd.amount_cents || 0) / 100).toFixed(2)
      });
      
      const currentTotal = parseFloat(acc[regionKey].totalAmount);
      acc[regionKey].totalAmount = (currentTotal + ((dd.amount_cents || 0) / 100)).toFixed(2);
      
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/admin/distribution_dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {distribution && (
          <>
            {/* Distribution Header */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {distribution.partner_name || 'Unnamed Distribution'}
                  </h1>
                  <p className="text-gray-500">
                    {new Date(distribution.transaction_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {distribution.tag && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {distribution.tag}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">
                  ${(distribution.amount_cents / 100).toLocaleString()}
                </p>
                <p className="text-gray-500">
                  {distribution.donation_distribution.length} donation{distribution.donation_distribution.length !== 1 ? 's' : ''} allocated
                </p>
              </div>
            </div>

            {/* Allocated Donations Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Allocated Donations</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cause</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {distribution.donation_distribution.map((dd) => (
                      <tr key={`${dd.donation_id}-${dd.cause_id}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(dd.donation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{dd.donation.donor_name}</div>
                          <div className="text-sm text-gray-500">{dd.donation.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${((dd.amount_cents || 0) / 100).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dd.cause.cause}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={() => window.open(`/admin/receipt/${dd.donation.id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
