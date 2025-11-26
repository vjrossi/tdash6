'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { exchangeCodeForToken } from '@/app/actions';

export default function CallbackClientPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  // State for the asynchronous error from the token exchange
  const [asyncError, setAsyncError] = useState<string | null>(null);

  // Derived state for the synchronous error
  const syncError = !code ? "Did not receive an authorization code from Tesla." : null;

  useEffect(() => {
    // Only run the effect if there is a code to exchange
    if (code) {
      const performExchange = async () => {
        const result = await exchangeCodeForToken(code);
        if (result.success) {
          // On success, redirect to the dashboard.
          router.push('/dashboard');
        } else {
          // On failure, set the asynchronous error state.
          setAsyncError(result.error || 'An unknown error occurred during token exchange.');
        }
      };
      performExchange();
    }
  }, [code, router]);

  const error = syncError || asyncError;

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
            <div>
                <h1 className="text-4xl font-bold text-red-500 mb-4">Authentication Failed</h1>
                <p className="text-gray-400 bg-gray-800 p-4 rounded">{error}</p>
            </div>
        ) : (
            <div>
                <h1 className="text-4xl font-bold mb-4">Finalizing Authentication...</h1>
                <p className="text-gray-400">Please wait while we securely log you in.</p>
            </div>
        )}
      </div>
    </div>
  );
}
