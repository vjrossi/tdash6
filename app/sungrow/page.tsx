'use client';

import Link from 'next/link';

export default function SungrowPage() {
  // Correctly construct the URL without duplicating the protocol in the redirectUrl
  const sungrowAuthorizeUrl = `https://auweb3.isolarcloud.com/#/authorized-app?cloudId=7&applicationId=583&redirectUrl=${process.env.NEXT_PUBLIC_SUNGROW_REDIRECT_URL}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Connect to Sungrow</h1>
      <Link
        href={sungrowAuthorizeUrl}
        className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Connect to Sungrow
      </Link>
    </div>
  );
}
