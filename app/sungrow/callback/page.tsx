'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSungrowToken } from '../actions';

function SungrowCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const code = searchParams.get('code');

    async function exchangeToken() {
      if (!code) {
        setError('No authorization code found in the URL.');
        return;
      }
      const result = await getSungrowToken(code);

      if (result.success) {
        setMessage('Authentication successful! Redirecting to your dashboard...');
        router.push('/sungrow/dashboard');
      } else {
        setError(result.error || 'An unknown error occurred during token exchange.');
      }
    }

    exchangeToken();
  }, [searchParams, router]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sungrow Authentication</h1>
      {error ? (
        <div>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

export default function SungrowCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SungrowCallback />
        </Suspense>
    )
}