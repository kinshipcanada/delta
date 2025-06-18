import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@lib/utils/helpers';
import { region_enum } from '@prisma/client';

interface Distribution {
  id: string;
  date: string;
  donation_id: string;
  amount_donated: number;
  name: string;
  email: string;
  desc: string;
  distribution: string;
  distribution_2: string;
}

interface Goal {
  id: string;
  distribution_title: string;
  goal_amount: number;
  region: region_enum;
  created_at: string;
  updated_at: string;
}

interface Cause {
  cause: string;
  amount_cents: number;
}

interface DistributionWithCauses extends Distribution {
  causes: Cause[];
}

interface LetterData {
  institutionName: string;
  recipientName: string;
  date: string;
  reference: string;
  totalAmount: string;
  causes: { cause: string; amount: string; }[];
}

export default function GoalDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [goalDetails, setGoalDetails] = useState<Goal | null>(null);
  const [allocatedDistributions, setAllocatedDistributions] = useState<Distribution[]>([]);
  const [unallocatedDistributions, setUnallocatedDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllocatedOpen, setIsAllocatedOpen] = useState(true);
  const [isUnallocatedOpen, setIsUnallocatedOpen] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [letterData, setLetterData] = useState<LetterData | null>(null);
  const [showDownload, setShowDownload] = useState(false);

  const fetchData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch goal details
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();

      if (goalError) throw goalError;
      setGoalDetails(goalData);

      // Fetch allocated distributions for this goal
      const { data: allocatedData, error: allocatedError } = await supabase
        .from('distribution')
        .select('*')
        .eq('goal_id', id);

      if (allocatedError) throw allocatedError;
      setAllocatedDistributions(allocatedData || []);

      // Fetch unallocated distributions
      const { data: unallocatedData, error: unallocatedError } = await supabase
        .from('distribution')
        .select('*')
        .is('goal_id', null);

      if (unallocatedError) throw unallocatedError;
      setUnallocatedDistributions(unallocatedData || []);

      // Calculate total amounts for progress bar
      const totalTargetAmount = goalData.goal_amount; // Assuming this is in cents
      const totalDonatedAmount = allocatedData.reduce((total, dist) => total + dist.amount_donated, 0); // Sum of amounts in cents

      setTotalDonated(totalDonatedAmount);
      setTotalTarget(totalTargetAmount);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const allocateDonation = async (donationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('distribution')
        .update({ goal_id: id })
        .eq('id', donationId);

      if (updateError) throw updateError;

      await fetchData();
    } catch (err) {
      console.error('Error allocating donation:', err);
      setError(err instanceof Error ? err.message : 'Failed to allocate donation');
    }
  };

  const removeDonation = async (donationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('distribution')
        .update({ goal_id: null })
        .eq('id', donationId);

      if (updateError) throw updateError;

      await fetchData();
    } catch (err) {
      console.error('Error removing donation:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove donation');
    }
  };

  const toggleAllocated = () => {
    setIsAllocatedOpen(!isAllocatedOpen);
  };

  const toggleUnallocated = () => {
    setIsUnallocatedOpen(!isUnallocatedOpen);
  };

  const handleCreateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First ensure we have the goal details
      if (!goalDetails?.distribution_title) {
        throw new Error('Goal distribution title is not available');
      }

      // Fetch distributions for this specific goal only
      const { data: distributions, error: distributionsError } = await supabase
        .from('distribution')
        .select('*')
        .eq('goal_id', id)
        .not('goal_id', 'is', null)
        .not('donation_id', 'is', null);

      if (distributionsError) throw distributionsError;
      
      if (!distributions || distributions.length === 0) {
        throw new Error('No valid distributions found with this goal ID');
      }
      
      console.log('Fetched distributions:', distributions);
      console.log('Goal ID being used:', id);
      console.log('Goal distribution title:', goalDetails.distribution_title);
      console.log('Number of valid distributions found:', distributions.length);

      // Since causes are linked to donations, not distributions, and we can have multiple 
      // distributions per donation with different goal_ids, we need to calculate the 
      // cause amounts based on the distribution amounts rather than the original cause amounts
      const causeMap = new Map<string, number>();
      let totalAmount = 0;

      distributions.forEach((dist: any) => {
        // Use the distribution description as the cause name and the distribution amount
        const causeName = dist.desc || 'General';
        const amount = dist.amount_donated / 100; // Convert cents to dollars
        
        console.log('Processing distribution as cause:', {
          cause: causeName,
          amount: amount,
          distribution_id: dist.id
        });
        
        causeMap.set(causeName, (causeMap.get(causeName) || 0) + amount);
        totalAmount += amount;
      });

      console.log('Final cause map:', Object.fromEntries(causeMap));
      console.log('Total amount:', totalAmount);

      if (totalAmount === 0) {
        throw new Error('No distributions found for this goal');
      }

      // Format amounts with 2 decimal places for currency
      const formattedCauses = Array.from(causeMap.entries()).map(([cause, amount]) => ({
        cause,
        amount: amount.toFixed(2) // Ensure 2 decimal places
      }));

      // Generate letter data
      const letterData = {
        institutionName,
        recipientName,
        date: new Date().toLocaleDateString(),
        reference: goalDetails.distribution_title,
        totalAmount: totalAmount.toFixed(2), // Ensure 2 decimal places
        causes: formattedCauses
      };

      console.log('Letter data being sent:', letterData);

      // Make POST request to generate PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(letterData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `distribution-letter-${letterData.reference.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Close modal and reset form
      setIsLetterModalOpen(false);
      setInstitutionName('');
      setRecipientName('');

    } catch (err) {
      console.error('Error generating letter:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate letter');
      // Keep the modal open on error so user can see the error
      alert(err instanceof Error ? err.message : 'Failed to generate letter');
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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
        <div className="flex justify-between mb-4">
          <button 
            onClick={() => router.push('/admin/distribution_dashboard')}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            &larr; Back to Dashboard
          </button>

          {/* Create Distribution Letter Button */}
          <button 
            onClick={() => setIsLetterModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Distribution Letter
          </button>
        </div>

        {/* Goal Details Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {goalDetails?.distribution_title}
          </h1>
          <div className="flex gap-4 text-gray-600">
            <p>Target Amount: ${totalTarget ? totalTarget.toLocaleString() : '0'}</p>
            <p>Region: {goalDetails?.region}</p>
          </div>
          
          {/* Conditional Rendering of Progress Bar or Total Donated Message */}
          {totalTarget > 0 ? (
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-teal-600">
                      ${(totalDonated / 100).toLocaleString()} / ${totalTarget.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex h-2 mb-4 overflow-hidden text-xs bg-gray-200 rounded">
                  <div style={{ width: `${totalTarget ? ((totalDonated/100) / totalTarget) * 100 : 0}%` }} className="flex flex-col text-center text-white bg-teal-600 shadow-none whitespace-nowrap transition-all duration-500 ease-in-out" />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mt-2">Total Donated: ${totalDonated ? (totalDonated / 100).toLocaleString() : '0'}</p>
          )}
        </div>

        {/* Allocated Distributions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Allocated Donations ({allocatedDistributions.length})
            </h2>
            <button onClick={toggleAllocated} className="text-gray-500">
              {isAllocatedOpen ? '-' : '+'}
            </button>
          </div>
          {isAllocatedOpen && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allocatedDistributions.map((dist) => (
                    <tr key={dist.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dist.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dist.name}</div>
                        <div className="text-sm text-gray-500">{dist.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${((dist.amount_donated / 100).toLocaleString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dist.desc || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-red-600 hover:text-red-800 font-medium"
                          onClick={() => removeDonation(dist.id)}
                        >
                          Remove Donation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Unallocated Distributions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Unallocated Donations ({unallocatedDistributions.length})
            </h2>
            <button onClick={toggleUnallocated} className="text-gray-500">
              {isUnallocatedOpen ? '-' : '+'}
            </button>
          </div>
          {isUnallocatedOpen && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unallocatedDistributions.map((dist) => (
                    <tr key={dist.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dist.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dist.name}</div>
                        <div className="text-sm text-gray-500">{dist.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${((dist.amount_donated / 100).toLocaleString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dist.desc || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => allocateDonation(dist.id)}
                        >
                          Allocate to Goal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Letter Generation Form Modal */}
        {isLetterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create Distribution Letter</h2>
              <form onSubmit={handleCreateLetter}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="institutionName">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    id="institutionName"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipientName">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      setIsLetterModalOpen(false);
                      setInstitutionName('');
                      setRecipientName('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Generate Letter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
