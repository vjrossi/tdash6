'use client';

import { Suspense } from 'react';
import SungrowAuthClientPage from './client-page';

export default function SungrowAuthCallback() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SungrowAuthClientPage />
    </Suspense>
  );
}
