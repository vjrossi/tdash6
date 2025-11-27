'use client';

import { useEffect, useState } from 'react';
import { getSungrowPsList, logout, getTokens } from '../actions';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [psList, setPsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthAndFetchData() {
        const { accessToken } = await getTokens();
        if (!accessToken) {
            router.push('/'); // Redirect to home if not authenticated
            return;
        }

        const list = await getSungrowPsList();
        setPsList(list);
        setLoading(false);
    }

    checkAuthAndFetchData();
  }, [router]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sungrow Dashboard</h1>
      <p>Welcome! You are successfully authenticated.</p>
      
      <h2>Your Power Stations</h2>
      {psList.length > 0 ? (
        <ul>
          {psList.map(psId => <li key={psId}>{psId}</li>)}
        </ul>
      ) : (
        <p>No power stations found for your account.</p>
      )}

      <button 
        onClick={handleLogout} 
        style={{ marginTop: '2rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        Log Out
      </button>
    </div>
  );
}
