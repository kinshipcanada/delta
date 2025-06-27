import { useEffect, useState } from 'react';
import { Button, ButtonStyle } from '@components/primitives';
import { useRouter } from 'next/router';
import { useAuth } from '@components/prebuilts/Authentication';
import { createClient } from '@supabase/supabase-js';
import DonationEntryModal from '@components/modals/DonationEntryModal';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Transaction {
  transaction_id: string;
  date: string;
  name: string;
  amount: number;
  category: string[] | string | null;
  pending: boolean;
  merchant_name: string | null;
  payment_channel: string;
  authorized_date: string;
  account_id: string;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

interface CachedTransactions {
  transactions: Transaction[];
  timestamp: number;
}

const REGIONS = ['INDIA', 'TANZANIA', 'CANADA', 'IRAQ', 'ANYWHERE'] as const;

interface FormattedDonationData {
  donation: {
    id: string;
    donor_name: string;
    email: string;
    line_address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    amount_charged_cents: number;
    date: Date;
    status: string;
    et_ref_num: string;
    fee_charged_by_processor: number;
    fees_covered_by_donor: number;
    stripe_customer_id: string | null;
    stripe_transfer_id: string | null;
    stripe_charge_id: string | null;
    version: 6;
  };
  causes: Array<{
    id: string;
    cause: string;
    region: string;
    amount_cents: number;
  }>;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { donor } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingTransactions, setSavingTransactions] = useState<Set<string>>(new Set());
  const [savedTransactions, setSavedTransactions] = useState<Set<string>>(new Set());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCachedTransactions = (): CachedTransactions | null => {
    try {
      const cached = sessionStorage.getItem('plaidTransactions');
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

  const setCachedTransactions = (transactions: Transaction[]) => {
    try {
      const cacheData: CachedTransactions = {
        transactions,
        timestamp: Date.now()
      };
      sessionStorage.setItem('plaidTransactions', JSON.stringify(cacheData));
      setLastFetchTime(cacheData.timestamp);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  };

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < parseInt(process.env.NEXT_PUBLIC_TRANSACTION_CACHE_DURATION || '300000');
  };

  const fetchTransactions = async (forceFetch: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not forcing a fresh fetch
      if (!forceFetch) {
        const cached = getCachedTransactions();
        if (cached && isCacheValid(cached.timestamp)) {
          console.log('Using cached transactions');
          setTransactions(cached.transactions);
          setLastFetchTime(cached.timestamp);
          setLoading(false);
          return;
        }
      }

      console.log('Fetching fresh transactions...');
      const response = await fetch('/api/plaid/transactions/sync');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      console.log('Fetched transactions:', data.transactions?.length);
      setTransactions(data.transactions || []);
      setCachedTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(
        err instanceof Error 
          ? `Failed to load transactions: ${err.message}` 
          : 'An unexpected error occurred while fetching transactions'
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkPlaidSession = async () => {
      try {
        const response = await fetch('/api/plaid/check-env?sessionOnly=true');
        const data = await response.json();
        
        if (!data.success || !data.hasValidSession) {
          router.push('/admin/login');
          return;
        }
        
        fetchTransactions();
      } catch (err) {
        console.error('Error checking Plaid session:', err);
        router.push('/admin/login');
      }
    };

    checkPlaidSession();
  }, [router]);

  const handleRefresh = () => {
    fetchTransactions(true);
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

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      setSavingTransactions(prev => new Set(prev).add(transaction.transaction_id));
      
      // Parse and validate the date
      let transactionDate: Date;
      try {
        transactionDate = new Date(transaction.date);
        if (isNaN(transactionDate.getTime())) {
          throw new Error('Invalid transaction date');
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        alert('Invalid transaction date. Please check the data.');
        return;
      }

      const donationData = {
        id: transaction.transaction_id,
        status: transaction.pending ? 'pending' : 'completed',
        date: transactionDate.toISOString(),
        donor_name: transaction.merchant_name || 'Anonymous',
        email: null,
        amount_donated_cents: Math.abs(transaction.amount) * 100,
        amount_charged_cents: Math.abs(transaction.amount) * 100,
        line_address: null,
        city: null,
        state: null,
        country: null,
        postal_code: null,
        fee_charged_by_processor: 0,
        fees_covered_by_donor: 0,
        stripe_customer_id: null,
        stripe_transfer_id: null,
        stripe_charge_id: null,
        version: 1
      };

      const { error: supabaseError } = await supabase
        .from('donation')
        .upsert([donationData], {
          onConflict: 'id'
        });

      if (supabaseError) {
        throw supabaseError;
      }

      setSavedTransactions(prev => new Set(prev).add(transaction.transaction_id));
      console.log('Transaction saved successfully:', transaction.transaction_id);
    } catch (err) {
      console.error('Error saving transaction:', err);
      alert('Failed to save transaction. Please try again.');
    } finally {
      setSavingTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transaction.transaction_id);
        return newSet;
      });
    }
  };

  const handleGenerateReceipt = async (transaction: Transaction) => {
    try {
      const response = await fetch('/api/plaid/check-env?sessionOnly=true');
      const data = await response.json();
      
      if (!data.success || !data.hasValidSession) {
        router.push('/admin/login');
        return;
      }
      
      setSelectedTransaction(transaction);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error checking Plaid session:', err);
      router.push('/admin/login');
    }
  };

  const handleModalSubmit = async (formData: FormattedDonationData) => {
    try {
      const response = await fetch('/api/donations/e-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationData: formData.donation,
          causesData: formData.causes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'AUTH_SESSION_EXPIRED' || data.code === 'PLAID_SESSION_EXPIRED') {
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || 'Failed to create donation');
      }

      setIsModalOpen(false);
      fetchTransactions(true);
    } catch (error) {
      console.error('Error creating donation:', error);
      alert(`Failed to save donation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading transactions...</span>
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
              <h3 className="text-sm font-medium text-red-800">Error loading transactions</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Bank Transactions</h1>
          <div className="flex gap-4">
            <Button
              onClick={handleRefresh}
              text={`Refresh${lastFetchTime ? ` (Last updated: ${formatDate(new Date(lastFetchTime).toISOString())})` : ''}`}
              style={ButtonStyle.Secondary}
            />
            <Button
              onClick={() => router.push('/admin/distribution_dashboard')}
              text="Distribution Dashboard"
              style={ButtonStyle.Secondary}
            />
            <Button
              onClick={handleLogout}
              text="Logout"
              style={ButtonStyle.Secondary}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent e-Transfer Autodeposits</h2>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .filter(tx => tx.name.toLowerCase().includes(process.env.NEXT_PUBLIC_TRANSACTION_FILTER || 'e-transfer - autodeposit'))
                    .map((transaction) => (
                      <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(transaction.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(transaction.authorized_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.merchant_name || transaction.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.payment_channel}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.pending ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Posted
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleGenerateReceipt(transaction)}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Generate Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            {!transactions.some(tx => tx.name.toLowerCase().includes(process.env.NEXT_PUBLIC_TRANSACTION_FILTER || 'e-transfer - autodeposit')) && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No e-Transfer Autodeposits found</p>
              </div>
            )}
          </div>
        </div>

        {selectedTransaction && (
          <DonationEntryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            transaction={{
              id: selectedTransaction.transaction_id,
              date: selectedTransaction.date,
              amount: selectedTransaction.amount,
              name: selectedTransaction.name,
              description: selectedTransaction.payment_channel
            }}
          />
        )}
      </div>
    </div>
  );
}