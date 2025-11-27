'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTokens } from './actions'; // NOTE: from ./actions (inside /sungrow), not ../actions

export default function SungrowPage() {
  const router = useRouter();

  useEffect(() => {
    async function run() {
      // Ask the server if we already have Sungrow tokens
      const { refreshToken } = await getTokens();

      // If we already have a refresh token, we're connected → go straight to dashboard
      if (refreshToken) {
        router.push('/sungrow/dashboard');
        return;
      }

      // Otherwise, start the Sungrow OAuth / consent flow
      const authorizeUrl =
        `https://auweb3.isolarcloud.com/#/authorized-app?cloudId=7&applicationId=583&redirectUrl=${process.env.NEXT_PUBLIC_SUNGROW_REDIRECT_URL}`;

      window.location.href = authorizeUrl;
    }

    run();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <p className="text-xl">Redirecting to Sungrow…</p>
    </div>
  );
}
