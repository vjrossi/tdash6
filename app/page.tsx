'use client';

import Image from "next/image";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getTokens } from './sungrow/actions';

export default function Home() {
  const [hasSungrow, setHasSungrow] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const { refreshToken } = await getTokens();
        setHasSungrow(!!refreshToken);
      } catch (err) {
        console.error("Error checking Sungrow tokens:", err);
        setHasSungrow(false);
      }
    }

    check();
  }, []);

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_TESLA_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/callback`;
    const scope = 'openid vehicle_device_data vehicle_cmds vehicle_charging_cmds';
    const responseType = 'code';
    const state = 'your_random_state'; // Should be random value in production

    const teslaAuthUrl =
      `https://auth.tesla.com/oauth2/v3/authorize?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=${responseType}` +
      `&scope=${scope}` +
      `&state=${state}`;

    window.location.href = teslaAuthUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">

          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Tesla & Sungrow API Demo
          </h1>

          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Login with your Tesla or Sungrow account to continue.
          </p>

          <div className="flex flex-col gap-4 md:flex-row">

            {/* Tesla */}
            <button
              onClick={handleLogin}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[200px]"
            >
              Login with Tesla
            </button>

            {/* Sungrow: Smart button */}
            {!hasSungrow ? (
              <Link
                href="/sungrow"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:w-[200px]"
              >
                Connect to Sungrow
              </Link>
            ) : (
              <Link
                href="/sungrow/dashboard"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-white transition-colors hover:bg-green-700 md:w-[200px]"
              >
                Go to Sungrow Dashboard
              </Link>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
