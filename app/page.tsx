'use client';

import Image from "next/image";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getTokens as getSungrowTokens } from './sungrow/actions';
import { getAccessToken as getTeslaToken } from './actions';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Check both Sungrow + Tesla on load
  useEffect(() => {
    async function check() {
      try {
        const sungrow = await getSungrowTokens();
        const teslaToken = await getTeslaToken();

        // If either integration exists, go to the unified dashboard
        if (sungrow?.accessToken || teslaToken) {
          router.replace('/dashboard');
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        setChecking(false);
      }
    }

    void check();
  }, [router]);

  const handleTeslaLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_TESLA_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/callback`;
    const scope = 'openid vehicle_device_data vehicle_cmds vehicle_charging_cmds';
    const responseType = 'code';
    const state = 'login_root';

    window.location.href = `https://auth.tesla.com/oauth2/v3/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;
  };

  const handleSungrowLogin = () => {
    window.location.href = `https://auweb3.isolarcloud.com/#/authorized-app?cloudId=7&applicationId=583&redirectUrl=${process.env.NEXT_PUBLIC_SUNGROW_REDIRECT_URL}`;
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading T-Dash...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">

          <h1 className="max-w-md text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Energy Dashboard
          </h1>

          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Connect your accounts to view vehicle and solar data in one place.
          </p>

          <div className="flex flex-col gap-4 w-full sm:w-auto">
            <button
              onClick={handleTeslaLogin}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] sm:w-auto font-medium"
            >
              Login with Tesla
            </button>

            <button
              onClick={handleSungrowLogin}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-white transition-colors hover:bg-blue-700 sm:w-auto font-medium"
            >
              Connect Sungrow
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}