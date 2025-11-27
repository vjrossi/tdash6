'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getTokens,
  logout,
  getSungrowPlantDetails,
  type SungrowPlantBasicInfo,
} from '../actions';

import {
  LogOut,
  Leaf,
  MapPin,
  Power,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<SungrowPlantBasicInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { accessToken } = await getTokens();
      if (!accessToken) {
        router.push('/');
        return;
      }

      const details = await getSungrowPlantDetails();
      setPlants(details);
      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-semibold">
            <Leaf className="h-8 w-8 text-emerald-400" />
            Sungrow Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm hover:border-red-500 hover:bg-red-600/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>

        {/* Plants */}
        <h2 className="text-xl font-semibold mb-3">Your Power Stations</h2>

        {plants.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
            No plants found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {plants.map((p) => (
              <div
                key={p.psId}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/40"
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-sm text-slate-500">ID: {p.psId}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{p.location || 'No location'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Power className="h-4 w-4 text-slate-400" />
                    <span>
                      {p.capacityKw != null ? `${p.capacityKw} W` : 'Unknown capacity'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{p.installDate || 'Unknown install date'}</span>
                  </div>

                  <div className="text-slate-400 text-xs">
                    Type: {p.typeName || 'Unknown'} |
                    Timezone: {p.timezone || 'N/A'}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
