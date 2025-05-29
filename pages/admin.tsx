import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button, ButtonStyle } from '@components/primitives';

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

export default function AdminPage() {
  const [linkToken, setLinkToken] = useState(null);
  const [isLinked, setIsLinked] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const generateToken = async () => {
    try {
      console.log("Requesting link token...");
      const response = await fetch('/api/plaid/create-link-token');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Link token error:", errorData);
        setLinkError(`Error: ${errorData.error}`);
        return;
      }
      
      const data = await response.json();
      console.log("Link token received:", data);
      
      if (data.link_token) {
        setLinkToken(data.link_token);
        setLinkError(null);
      } else {
        setLinkError("No link token in response");
      }
    } catch (error) {
      console.error('Error generating link token:', error);
      setLinkError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // on mount, generate a new link token
  useEffect(() => {
    generateToken();
  }, []);

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
      } else {
        console.error('Failed to link bank account:', data.error);
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
    }
  }, []);

  // ready tells us if the link token is ready to be used
  // open is the function that is called when the Plaid Link modal is opened
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

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
              Bank account successfully linked! You can now test the available endpoints below.
            </p>
          </div>

          <div className="space-y-6">
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

            <PlaidEndpoint
              name="Account Info"
              description="View detailed information about your linked accounts"
              endpoint="accounts/info"
              buttonText="View Info"
            />
          </div>
        </>
      )}
    </div>
  );
}
