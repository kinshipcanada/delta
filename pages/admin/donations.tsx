import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Button, ButtonStyle } from '@components/primitives';
import { useRouter } from 'next/router';
import { useAuth } from '@components/prebuilts/Authentication';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add debug logging
console.log('Initializing Supabase client...');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

interface Donation {
  id: string;
  date: string;
  donation_id: string;
  amount_donated: number;
  name: string;
  email: string;
  desc: string;
  distribution: string;
  distribution_2: string;
  distribution_3: string;
  vision_kinship_1: number;
  vision_kinship_2: number;
  vision_kinship_3: number;
  vision_kinship_4: number;
  vision_kinship_5: number;
  vision_kinship_6: number;
  vision_kinship_2025: number;
  ramadhan_india: number;
  ramadhan_iraq: number;
  ramadhan_africa: number;
  education_africa: number;
  poverty_relief_africa: number;
  orphan_campaign_al_anwar_iraq: number;
  imam_ridha_khums_iraq: number;
  orphans_india: number;
  medical_aid_india: number;
  housing_india: number;
  widows_india: number;
  sadaqah_india: number;
  education_india: number;
  fidya_india: number;
  quran_india: number;
  khums_sadat_india: number;
  poverty_relief_india: number;
  arbaeen_iraq: number;
  donations_for_admin_payments: number;
}

export default function DonationsPage() {
  const router = useRouter();
  const { donor } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaidLinked, setIsPlaidLinked] = useState(false);

  useEffect(() => {
    const checkPlaidSession = async () => {
      try {
        const response = await fetch('/api/plaid/check-env');
        const data = await response.json();
        
        if (!data.success || !data.hasValidSession) {
          router.push('/admin/login');
          return;
        }
        
        // If we have a valid session, fetch donations
        fetchDonations();
      } catch (err) {
        console.error('Error checking Plaid session:', err);
        router.push('/admin/login');
      }
    };

    checkPlaidSession();
  }, [router]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching donations...');
      
      const { data, error: supabaseError } = await supabase
        .from('distributions')
        .select('*')
        .order('date', { ascending: false });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message);
      }

      if (!data) {
        throw new Error('No data received from Supabase');
      }

      console.log('Fetched donations:', data.length);
      setDonations(data);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError(
        err instanceof Error 
          ? `Failed to load donations: ${err.message}` 
          : 'An unexpected error occurred while fetching donations'
      );
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading donations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading donations</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <Button
            onClick={fetchDonations}
            text="Refresh"
            style={ButtonStyle.Secondary}
          />
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donation.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(donation.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{donation.name}</div>
                      <div className="text-sm text-gray-500">{donation.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${donation.amount_donated.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{donation.distribution}</div>
                      {donation.distribution_2 && (
                        <div className="text-sm text-gray-500">{donation.distribution_2}</div>
                      )}
                      {donation.distribution_3 && (
                        <div className="text-sm text-gray-500">{donation.distribution_3}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {donations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No donations found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
