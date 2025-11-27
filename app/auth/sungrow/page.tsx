'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSungrowToken } from '../../sungrow/actions';

function SungrowAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    if (code) {
      console.log('[CLIENT] Authorization code received:', code);
      const fetchToken = async () => {
        try {
          console.log('[CLIENT] Requesting token from server...');
          const data = await getSungrowToken(code);
          console.log('[CLIENT] Token data received:', data);
          if (data.success) {
            setMessage('Authentication successful! Redirecting to your dashboard...');
            router.push('/sungrow/dashboard');
          } else {
            setError(data.error || 'An unknown error occurred.');
          }
        } catch (err: any) {
          console.error('[CLIENT] Error fetching token:', err);
          setError(err.message || 'An unknown error occurred.');
          if (err.responseBody) {
            setRawError(err.responseBody);
          }
        }
      };
      fetchToken();
    }
  }, [code, router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-400">Sungrow Auth Callback</h1>
        {code && !error && (
          <p className="text-center text-lg">{message}</p>
        )}
        {error && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-red-400">Authentication Failed</h2>
            <p className="text-center text-red-300">{error}</p>
            {rawError && (
                <div>
                    <h3 className="text-lg font-semibold text-center mt-4">Server Response:</h3>
                    <div className="bg-gray-700 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap" 
                         dangerouslySetInnerHTML={{ __html: rawError }} />
                </div>
            )}
          </div>
        )}
        {!code && <p className="text-center text-red-500">No authorization code found in URL.</p>}
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
