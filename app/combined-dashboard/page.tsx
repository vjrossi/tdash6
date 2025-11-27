'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  getVehicles,
  getVehicleData,
  logout as teslaLogout,
} from '@/app/actions';
import { VehicleCard } from '@/app/components/VehicleCard';
import type { Vehicle } from '@/lib/types';

import {
  getTokens as getSungrowTokens,
  logout as sungrowLogout,
  getSungrowPlantDetails,
  type SungrowPlantBasicInfo,
} from '@/app/sungrow/actions';

import {
  LogOut,
  Leaf,
  MapPin,
  Power,
  Clock,
} from 'lucide-react';

/* ---------- Tesla panel (reuses Tesla dashboard logic) ---------- */

type VehicleWithData = Vehicle & {
  vehicle_data: unknown | null;
  error: string | null;
};

function TeslaPanel() {
  const [vehiclesWithData, setVehiclesWithData] = useState<VehicleWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllVehicleData = async () => {
    setLoading(true);
    setError(null);

    try {
      const vehicles: Vehicle[] | null = await getVehicles();

      if (vehicles && vehicles.length > 0) {
        const vehicleDataResults = await Promise.all(
          vehicles.map((v) => getVehicleData(v.id_s))
        );

        const withData: VehicleWithData[] = vehicles.map((vehicle, index) => {
          const dataResult = vehicleDataResults[index];
          return {
            ...vehicle,
            vehicle_data: dataResult.success ? dataResult.data : null,
            error: !dataResult.success ? dataResult.error : null,
          };
        });

        setVehiclesWithData(withData);
      } else {
        setVehiclesWithData([]);
        setError(
          'No vehicles were found for your account, or there was an error fetching data.'
        );
      }
    } catch (e) {
      console.error('Failed to fetch vehicle data', e);
      setError('An unexpected error occurred while fetching vehicle data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllVehicleData();
  }, []);

  const handleRefresh = async (vehicleId: string) => {
    try {
      const dataResult = await getVehicleData(vehicleId);
      setVehiclesWithData((current) =>
        current.map((v) =>
          v.id_s === vehicleId
            ? {
              ...v,
              vehicle_data: dataResult.success ? dataResult.data : null,
              error: !dataResult.success ? dataResult.error : null,
            }
            : v
        )
      );
    } catch (e) {
      console.error('Failed to refresh vehicle data', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-cyan-400">T-Dash</h2>

        {/* Same logout behaviour as your Tesla dashboard */}
        <form action={teslaLogout}>
          <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-sm py-2 px-3 rounded transition-colors duration-200">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Loading vehicle data…
        </div>
      ) : error ? (
        <div className="space-y-4 py-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchAllVehicleData}
            className="inline-flex items-center rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : vehiclesWithData.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {vehiclesWithData.map((vehicle) => (
            <VehicleCard
              key={vehicle.id_s}
              vehicle={vehicle}
              onRefresh={() => handleRefresh(vehicle.id_s)}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-slate-400">
          No vehicles were found for your account.
        </div>
      )}
    </div>
  );
}

/* ---------- Sungrow panel (reuses Sungrow dashboard logic) ---------- */

function SungrowPanel() {
  const router = useRouter();
  const [plants, setPlants] = useState<SungrowPlantBasicInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const { accessToken } = await getSungrowTokens();
        if (!accessToken) {
          router.push('/');
          return;
        }

        const details = await getSungrowPlantDetails();
        if (!cancelled) {
          setPlants(details);
        }
      } catch (e) {
        console.error('Failed to fetch Sungrow plant details', e);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    await sungrowLogout();
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        Loading Sungrow data…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Leaf className="h-6 w-6 text-emerald-400" />
          Sungrow Dashboard
        </h2>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs hover:border-red-500 hover:bg-red-600/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      {/* Plants */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Your Power Stations
        </h3>

        {plants.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400 text-sm">
            No plants found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {plants.map((p) => (
              <div
                key={p.psId}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/40 text-sm"
              >
                <div className="mb-4">
                  <h4 className="text-base font-semibold">{p.name}</h4>
                  <p className="text-xs text-slate-500">ID: {p.psId}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{p.location || 'No location'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Power className="h-4 w-4 text-slate-400" />
                    <span>
                      {p.capacityKw != null
                        ? `${p.capacityKw} W`
                        : 'Unknown capacity'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{p.installDate || 'Unknown install date'}</span>
                  </div>

                  <div className="text-slate-400 text-[11px]">
                    Type: {p.typeName || 'Unknown'} · Timezone:{' '}
                    {p.timezone || 'N/A'}
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

/* ---------- Combined page shell ---------- */

export default function CombinedDashboardPage() {
  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Page header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Combined Energy Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Tesla and Sungrow data side by side, using your existing
            integrations.
          </p>
        </header>

        {/* Two-column layout */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Tesla card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase tracking-wide">Tesla</span>
              <span className="font-mono">/dashboard</span>
            </div>
            <div className="h-px bg-slate-800" />
            <TeslaPanel />
          </div>

          {/* Sungrow card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase tracking-wide">Sungrow</span>
              <span className="font-mono">/sungrow/dashboard</span>
            </div>
            <div className="h-px bg-slate-800" />
            <SungrowPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
