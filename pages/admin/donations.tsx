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
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export default function TransactionsPage() {
  const router = useRouter();
  const { donor } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingTransactions, setSavingTransactions] = useState<Set<string>>(new Set());
  const [savedTransactions, setSavedTransactions] = useState<Set<string>>(new Set());

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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching transactions...');
      
      const response = await fetch('/api/plaid/transactions/sync');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      console.log('Fetched transactions:', data.transactions?.length);
      setTransactions(data.transactions || []);
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
              onClick={fetchTransactions}
              text="Refresh"
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
                          {savedTransactions.has(transaction.transaction_id) ? (
                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-md">
                              Saved ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSaveTransaction(transaction)}
                              disabled={savingTransactions.has(transaction.transaction_id)}
                              className={`px-3 py-1 text-xs font-medium rounded-md ${
                                savingTransactions.has(transaction.transaction_id)
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {savingTransactions.has(transaction.transaction_id) ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Saving...
                                </span>
                              ) : (
                                'Generate Receipt'
                              )}
                            </button>
                          )}
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

        {/* All Transactions Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Transactions</h2>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
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
                        <div className={`text-sm font-medium ${transaction.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {Array.isArray(transaction.category) 
                            ? transaction.category.join(', ')
                            : transaction.category || 'Uncategorized'}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}