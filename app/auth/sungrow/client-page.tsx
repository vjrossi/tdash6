'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSungrowToken } from '@/app/sungrow/actions';

export default function SungrowAuthClientPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [tokenData, setTokenData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      getSungrowToken(code)
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setTokenData(data);
          }
        })
        .catch(err => {
          console.error(err);
          setError('An unexpected error occurred.');
        });
    }
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Sungrow Auth Callback</h1>
      {code ? (
        <div>
          <p className="text-lg">Authorization code: {code}</p>
          {tokenData && (
            <div className="mt-4 p-4 bg-gray-800 rounded-md">
              <h2 className="text-2xl font-bold mb-2">Token Data</h2>
              <pre className="text-left text-sm">{JSON.stringify(tokenData, null, 2)}</pre>
            </div>
          )}
          {error && <p className="text-lg text-red-500">Error: {error}</p>}
        </div>
      ) : (
        <p className="text-lg">No authorization code found.</p>
      )}
    </div>
  );
}
