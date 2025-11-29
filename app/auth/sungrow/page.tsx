'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSungrowToken } from '../../sungrow/actions';

function SungrowAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    if (code) {
      const fetchToken = async () => {
        try {
          const data = await getSungrowToken(code);
          if (data.success) {
            setMessage('Authentication successful! Redirecting...');
            // UPDATE: Redirect to the new unified dashboard
            router.push('/dashboard');
          } else {
            setError(data.error || 'An unknown error occurred.');
          }
        } catch (err: any) {
          setError(err.message || 'An unknown error occurred.');
        }
      };
      fetchToken();
    }
  }, [code, router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-semibold text-red-400 mb-2">Failed</h2>
            <p className="text-red-300">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-green-400 mb-4">Connecting Sungrow</h1>
            <p className="text-gray-300 animate-pulse">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SungrowAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SungrowAuthCallback />
    </Suspense>
  );
}