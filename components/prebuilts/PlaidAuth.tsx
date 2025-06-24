import { useRouter } from 'next/router';
import { useEffect, useState, ReactNode } from 'react';

interface PlaidAuthProps {
  children: ReactNode;
  redirectTo?: string;
  onSessionExpired?: () => void;
}

export default function PlaidAuth({ 
  children, 
  redirectTo = '/admin/login',
  onSessionExpired 
}: PlaidAuthProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('PlaidAuth: Checking session...');
        
        const response = await fetch('/api/plaid/check-env', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('PlaidAuth: Session check failed with status:', response.status);
          throw new Error(`Session check failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('PlaidAuth: Session check response:', data);

        // Check if we have a valid session
        if (!data.success) {
          console.error('PlaidAuth: API returned success=false');
          throw new Error('Session check API returned unsuccessful response');
        }

        if (!data.hasValidSession) {
          console.log('PlaidAuth: No valid session found, redirecting to login');
          if (onSessionExpired) {
            onSessionExpired();
          }
          router.replace(redirectTo);
          return;
        }

        console.log('PlaidAuth: Valid session found');
        setHasValidSession(true);

      } catch (error) {
        console.error('PlaidAuth: Error checking session:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        
        if (onSessionExpired) {
          onSessionExpired();
        }
        
        // Use replace instead of push to avoid navigation loops
        router.replace(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    // Skip session check if we're already on the login page
    if (router.pathname === redirectTo) {
      console.log('PlaidAuth: Already on login page, skipping session check');
      setIsLoading(false);
      return;
    }

    checkSession();

    // Set up interval to check session periodically (every 5 minutes)
    const intervalId = setInterval(checkSession, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [router.pathname, redirectTo, onSessionExpired]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying session...</p>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Don't render anything if session is invalid (redirect is happening)
  if (!hasValidSession) {
    return null;
  }

  return <>{children}</>;
} 