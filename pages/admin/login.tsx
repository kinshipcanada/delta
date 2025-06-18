import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button, ButtonStyle } from '@components/primitives';
import { useRouter } from 'next/router';

interface PlaidEndpointProps {
  name: string;
  description: string;
  endpoint: string;
  buttonText: string;
}

const PlaidEndpoint = ({ name, description, endpoint, buttonText }: PlaidEndpointProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any | null>(null);

  const makeRequest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plaid/${endpoint}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResponse(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
    setIsLoading(false);
  };

  return (
    <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <Button
          onClick={makeRequest}
          text={isLoading ? 'Loading...' : buttonText}
          style={ButtonStyle.Primary}
        />
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {response && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Component to display transactions
interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  category: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
  mask: string;
  balance: {
    current: number;
    available: number | null;
    limit: number | null;
    currencyCode: string;
  };
}

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-500">No transactions found.</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={tx.amount > 0 ? "text-red-600" : "text-green-600"}>
                    ${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// After the other PlaidEndpoint component, replace the UberTransactionsEndpoint with this new component
const ReceivedETransfersEndpoint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eTransfers, setETransfers] = useState<Transaction[]>([]);
  const [issuingReceipt, setIssuingReceipt] = useState<string | null>(null);
  const [receiptIssued, setReceiptIssued] = useState<Record<string, boolean>>({});

  const fetchETransfers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plaid/transactions/sync');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else if (data.transactions) {
        // Filter for transactions containing "e-Transfer - Autodeposit" in the name
        const receivedETransfers = data.transactions.filter((tx: any) => 
          tx.name.toLowerCase().includes('e-transfer - autodeposit')
        );
        setETransfers(receivedETransfers);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
    setIsLoading(false);
  };

  const handleIssueReceipt = async (transaction: any) => {
    try {
      setIssuingReceipt(transaction.id);
      
      // Simulate API call to issue receipt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state to show receipt was issued
      setReceiptIssued(prev => ({
        ...prev,
        [transaction.id]: true
      }));
      
      // In a real app, you would call your API to create a receipt
      // For example:
      // await fetch('/api/receipts/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     transactionId: transaction.id,
      //     amount: transaction.amount,
      //     date: transaction.date,
      //     merchant: transaction.name,
      //     category: transaction.category
      //   })
      // });
      
    } catch (err) {
      setError('Failed to issue receipt');
      console.error('Error issuing receipt:', err);
    } finally {
      setIssuingReceipt(null);
    }
  };

  return (
    <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Received e-Transfers</h3>
          <p className="text-sm text-gray-600 mt-1">Find all your received e-transfers</p>
        </div>
        <Button
          onClick={fetchETransfers}
          text={isLoading ? 'Loading...' : 'Find e-Transfers'}
          style={ButtonStyle.Primary}
        />
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {eTransfers.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {eTransfers.map((tx: any) => (
            <div 
              key={tx.id} 
              className="flex flex-col p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-blue-900">{tx.name}</span>
                <span className="font-bold text-blue-800">${Math.abs(tx.amount).toFixed(2)}</span>
              </div>
              <div className="text-sm text-blue-700">{tx.date}</div>
              <div className="mt-2 text-xs text-blue-600">{tx.category}</div>
              <div className="mt-3 flex justify-end">
                {receiptIssued[tx.id] ? (
                  <div className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Receipt Issued
                  </div>
                ) : (
                  <button 
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                    onClick={() => handleIssueReceipt(tx)}
                    disabled={issuingReceipt === tx.id}
                  >
                    {issuingReceipt === tx.id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : "Issue Receipt"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
          <p className="text-gray-600">No e-transfers found. Try another search!</p>
        </div>
      )}
    </div>
  );
};

// Add this component after the ReceivedETransfersEndpoint component
const PlaidDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkEnvironment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/plaid/check-env');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error checking environment:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setIsLoading(false);
  };

  // Generate suggestions based on missing variables
  const getSuggestions = () => {
    if (!debugInfo || !debugInfo.missingVariables) return [];
    
    const suggestions = [];
    
    if (debugInfo.missingVariables.includes('PLAID_CLIENT_ID')) {
      suggestions.push('Add your Plaid Client ID to the environment variables');
    }
    
    if (debugInfo.missingVariables.includes('PLAID_SECRET')) {
      suggestions.push('Add your Plaid Secret Key to the environment variables');
    }
    
    if (debugInfo.missingVariables.includes('NEXT_PUBLIC_DOMAIN')) {
      suggestions.push('Set NEXT_PUBLIC_DOMAIN to your application domain (e.g., https://your-app.vercel.app)');
      suggestions.push('Alternatively, check if VERCEL_URL is available and use that for local development');
    }
    
    return suggestions;
  };

  return (
    <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Plaid Debugger</h3>
          <p className="text-sm text-gray-600 mt-1">Check Plaid configuration and environment</p>
        </div>
        <Button
          onClick={checkEnvironment}
          text={isLoading ? 'Checking...' : 'Check Environment'}
          style={ButtonStyle.Secondary}
        />
      </div>
      
      {debugInfo && (
        <div className="mt-4 space-y-4">
          {debugInfo.missingVariables && debugInfo.missingVariables.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 font-medium">Missing environment variables:</p>
              <ul className="list-disc pl-5 mt-1">
                {debugInfo.missingVariables.map((variable: string) => (
                  <li key={variable} className="text-red-600">{variable}</li>
                ))}
              </ul>
              
              {getSuggestions().length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-red-700 font-medium">Suggestions:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {getSuggestions().map((suggestion, index) => (
                      <li key={index} className="text-red-600">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="font-medium mb-2">Environment Check</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo.environment, null, 2)}
            </pre>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium mb-2">Plaid Setup Guide</h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-800">
              <li>Make sure you have a Plaid developer account</li>
              <li>Get your <strong>Client ID</strong> and <strong>Secret Key</strong> from the Plaid Dashboard</li>
              <li>Add these variables to your Vercel environment:
                <ul className="list-disc pl-5 mt-1">
                  <li>PLAID_CLIENT_ID</li>
                  <li>PLAID_SECRET (or PLAID_SANDBOX_SECRET_KEY for sandbox)</li>
                  <li>PLAID_ENV (set to "sandbox" for testing)</li>
                  <li>NEXT_PUBLIC_DOMAIN (your app's URL)</li>
                </ul>
              </li>
              <li>Redeploy your application after adding the variables</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState(null);
  const [isLinked, setIsLinked] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const generateToken = async () => {
    try {
      console.log("Requesting link token...");
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Link token error response:", errorData);
        setLinkError(`Error: ${errorData.error || 'Failed to create link token'}`);
        if (errorData.details) {
          console.error("Error details:", errorData.details);
        }
        return;
      }
      
      const data = await response.json();
      console.log("Link token response received:", data);
      
      if (data.link_token) {
        setLinkToken(data.link_token);
        setLinkError(null);
      } else {
        console.error("No link token in response:", data);
        setLinkError("No link token in response");
      }
    } catch (error) {
      console.error('Error generating link token:', error);
      setLinkError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    generateToken();
  }, []);

  // Function to fetch transactions and account data after successful linking
  const fetchPlaidData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch transactions
      const txResponse = await fetch('/api/plaid/transactions/sync');
      const txData = await txResponse.json();
      if (txData.success && txData.transactions) {
        setTransactions(txData.transactions);
      }

      // Fetch account balances
      const acctResponse = await fetch('/api/plaid/accounts/balance');
      const acctData = await acctResponse.json();
      if (acctData.success && acctData.accounts) {
        setAccounts(acctData.accounts);
      }
    } catch (error) {
      console.error('Error fetching Plaid data:', error);
    }
    setIsLoadingData(false);
  };

  // Handle successful Plaid Link
  const onSuccess = useCallback(async (public_token: string) => {
    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });
      const data = await response.json();
      
      if (data.success) {
        setIsLinked(true);
        // Fetch transactions and account data after successful linking
        await fetchPlaidData();
      } else {
        console.error('Failed to link bank account:', data.error);
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/plaid/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: process.env.PLAID_ACCESS_TOKEN }),
      });

      if (response.ok) {
        setIsLinked(false);
        setTransactions([]);
        setAccounts([]);
        router.push('/');
      } else {
        const errorData = await response.json();
        console.error('Logout error:', errorData);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Bank Account Integration</h1>
      
      {!isLinked ? (
        <div className="mb-8">
          {linkError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{linkError}</p>
              <Button
                onClick={generateToken}
                text="Retry Link Token"
                style={ButtonStyle.Secondary}
              />
            </div>
          )}
          
          {ready ? (
            <Button
              onClick={() => open()}
              text="Link Bank Account"
              style={ButtonStyle.Primary}
            />
          ) : (
            <Button
              onClick={() => {}}
              text="Preparing Link..."
              style={ButtonStyle.Primary}
            />
          )}
          <p className="mt-4 text-sm text-gray-600">
            Click to securely link your bank account using Plaid
          </p>
        </div>
      ) : (
        <>
          <div className="bg-green-50 p-4 rounded-md mb-8">
            <p className="text-green-800">
              Bank account successfully linked! You can now view your financial data below.
            </p>
          </div>

          {isLoadingData ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-600">Loading your financial data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Account Balances Section */}
              {accounts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Account Balances</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map(account => (
                      <div key={account.id} className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900">{account.name}</h3>
                        <p className="text-sm text-gray-500">{account.type} • {account.mask}</p>
                        <div className="mt-2">
                          <p className="text-xl font-bold">${account.balance.current?.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">
                            Available: ${account.balance.available?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Section */}
              {transactions.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                  <TransactionList transactions={transactions} />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                  <p className="text-gray-500">No transactions found. Try refreshing or check back later.</p>
                </div>
              )}

              {/* Always show the Refresh Transactions button */}
              <div className="mt-4">
                <Button
                  onClick={fetchPlaidData}
                  text={isLoadingData ? "Refreshing..." : "Refresh Transactions"}
                  style={ButtonStyle.Secondary}
                />
              </div>

              {/* Manual API Testing Endpoints */}
              <div className="border-t pt-8">
                <h2 className="text-xl font-semibold mb-4">API Testing</h2>
                <PlaidEndpoint
                  name="Test Transaction Sync"
                  description="Retrieve the latest transactions from your linked account"
                  endpoint="transactions/sync"
                  buttonText="Get Transactions"
                />
                
                <PlaidEndpoint
                  name="Account Balance"
                  description="Check the current balance of your linked accounts"
                  endpoint="accounts/balance"
                  buttonText="Check Balance"
                />

                <ReceivedETransfersEndpoint />
                
                <PlaidDebugger />
              </div>
            </div>
          )}

          {isLinked && (
            <div className="mt-8">
              <Button
                onClick={handleLogout}
                text="Logout"
                style={ButtonStyle.Secondary}
              />
              <Button
                onClick={() => router.push('/admin/donations-explorer')}
                text="Go to Donations Explorer"
                style={ButtonStyle.Primary}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
