import { useEffect, useState } from 'react';
import { Button, ButtonStyle } from '@components/primitives';
import { useRouter } from 'next/router';
import { useAuth } from '@components/prebuilts/Authentication';
import { createClient } from '@supabase/supabase-js';

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

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onSubmit: (donationData: any) => void;
}

const REGIONS = ['INDIA', 'TANZANIA', 'CANADA', 'IRAQ', 'ANYWHERE'] as const;

const DonationModal = ({ isOpen, onClose, transaction, onSubmit }: DonationModalProps) => {
  const [formData, setFormData] = useState({
    donor_name: transaction.merchant_name || 'Anonymous',
    email: '',
    line_address: '',
    city: '',
    state: '',
    country: 'CA',
    postal_code: '',
    cause: '',
    subcause: '',
    region: 'ANYWHERE',
    in_honor_of: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[32rem] shadow-lg rounded-md bg-white">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Receipt</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Donor Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.donor_name}
                onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.line_address}
              onChange={(e) => setFormData({ ...formData, line_address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State/Province</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cause</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.cause}
              onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subcause (Optional)</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.subcause}
              onChange={(e) => setFormData({ ...formData, subcause: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Region</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">In Honor Of (Optional)</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.in_honor_of}
              onChange={(e) => setFormData({ ...formData, in_honor_of: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => onSubmit(formData)}
            >
              Generate Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    // Check Plaid session before showing modal
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

  const handleModalSubmit = async (formData: any) => {
    if (!selectedTransaction) return;

    try {
      const donationData = {
        id: selectedTransaction.transaction_id,
        status: 'PROCESSING',
        date: new Date(selectedTransaction.date).toISOString(),
        donor_name: formData.donor_name,
        email: formData.email,
        amount_donated_cents: Math.abs(selectedTransaction.amount) * 100,
        amount_charged_cents: Math.abs(selectedTransaction.amount) * 100,
        line_address: formData.line_address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        fee_charged_by_processor: 0,
        fees_covered_by_donor: 0,
        cause: [{
          id: `${selectedTransaction.transaction_id}-cause`,
          donation_id: selectedTransaction.transaction_id,
          region: formData.region,
          amount_cents: Math.abs(selectedTransaction.amount) * 100,
          in_honor_of: formData.in_honor_of || null,
          cause: formData.cause,
          subcause: formData.subcause || null
        }]
      };

      const response = await fetch('/api/donations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        throw new Error('Failed to create donation');
      }

      setIsModalOpen(false);
      // Optionally refresh the transactions to show updated status
      fetchTransactions(true);
    } catch (error) {
      console.error('Error creating donation:', error);
      alert('Failed to generate receipt. Please try again.');
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
          <DonationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            transaction={selectedTransaction}
            onSubmit={handleModalSubmit}
          />
        )}
      </div>
    </div>
  );
}