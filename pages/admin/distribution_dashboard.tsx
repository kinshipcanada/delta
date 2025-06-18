import { useEffect, useState } from 'react';
import { supabase } from '@lib/utils/helpers';
import { region_enum } from '@prisma/client';
import Link from 'next/link';

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

interface ApiResponse {
  success: boolean;
  data?: {
    distributions: Distribution[];
    goals: Goal[];
  };
  error?: string;
}

export default function DistributionDashboard() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    distribution_title: '',
    goal_amount: '',
    region: 'ANYWHERE' as region_enum
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching distributions and goals...');
      
      const response = await fetch('/api/v2/database/connecting');
      const result = await response.json() as ApiResponse;

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setDistributions(result.data.distributions);
      setGoals(result.data.goals || []);
      console.log('Distributions loaded:', result.data.distributions.length);
      console.log('Goals loaded:', result.data.goals.length);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Set target amount to 0 if not provided
      const targetAmount = newGoal.goal_amount ? parseFloat(newGoal.goal_amount) : 0;

      const response = await fetch('/api/v2/database/adding_goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newGoal,
          goal_amount: targetAmount, // Use the target amount or default to 0
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create goal');
      }

      // Reset form and close modal
      setNewGoal({
        distribution_title: '',
        goal_amount: '',
        region: 'ANYWHERE' as region_enum
      });
      setIsModalOpen(false);

      // Refresh goals data
      await fetchData();
    } catch (err) {
      console.error('Error creating goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
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

        {/* Button Layout Area */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex flex-wrap gap-3">
              {goals.map(goal => (
                <Link key={goal.id} href={`/admin/goals/${goal.id}`} passHref>
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all p-4 cursor-pointer">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {goal.distribution_title}
                      </div>
                      {goal.goal_amount ? (
                        <div className="text-lg font-semibold text-blue-600">
                          ${goal.goal_amount.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-gray-600">
                          <span className="block h-6"></span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Region: {goal.region}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Goal
            </button>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add New Goal</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="distribution_title">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    id="distribution_title"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newGoal.distribution_title}
                    onChange={(e) => setNewGoal({...newGoal, distribution_title: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="goal_amount">
                    Target Amount ($)
                  </label>
                  <input
                    type="number"
                    id="goal_amount"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newGoal.goal_amount}
                    onChange={(e) => setNewGoal({...newGoal, goal_amount: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">
                    Region
                  </label>
                  <select
                    id="region"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newGoal.region}
                    onChange={(e) => setNewGoal({...newGoal, region: e.target.value as region_enum})}
                    required
                  >
                    {Object.values(region_enum).map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      setNewGoal({
                        distribution_title: '',
                        goal_amount: '',
                        region: 'ANYWHERE' as region_enum
                      });
                      setIsModalOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Unallocated Distributions ({distributions.length})
            </h2>
          </div>
          
          {distributions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No distributions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cause</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distributions.map((dist) => (
                    <tr key={dist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dist.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dist.name}</div>
                        <div className="text-sm text-gray-500">{dist.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(dist.amount_donated / 100).toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dist.desc || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
