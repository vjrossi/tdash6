import { Suspense } from 'react';
import CallbackClientPage from './client-page';

function Loading() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-gray-400">Waiting for authorization from Tesla...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CallbackClientPage />
    </Suspense>
  );
}
