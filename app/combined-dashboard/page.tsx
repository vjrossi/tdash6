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

  if (!plants.length) {
    return (
      <div className="space-y-6">
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

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-400 text-sm">
          No power stations found for your Sungrow account.
        </div>
      </div>
    );
  }

  const primary = plants[0];
  const others = plants.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Leaf className="h-6 w-6 text-emerald-400" />
            Sungrow Dashboard
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Overview of your Sungrow power stations.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs hover:border-red-500 hover:bg-red-600/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      {/* Primary plant hero card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{primary.name}</h3>
            <p className="text-xs text-slate-500">ID: {primary.psId}</p>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{primary.location || 'No location set'}</span>
            </div>
          </div>

          {/* This area is ready for live metrics later */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Primary metrics
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-200 font-medium">
                  {primary.capacityKw != null
                    ? `${primary.capacityKw} W capacity`
                    : 'Capacity: Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-4 w-4" />
                <span>
                  Installed:{' '}
                  {primary.installDate || 'Unknown install date'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Type: {primary.typeName || 'Unknown'} · Timezone:{' '}
                {primary.timezone || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Stat tiles (similar feel to Tesla’s little panels) */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Capacity
            </p>
            <p className="text-2xl font-semibold">
              {primary.capacityKw != null ? (
                <>
                  {primary.capacityKw}
                  <span className="ml-1 text-sm text-slate-400">W</span>
                </>
              ) : (
                <span className="text-sm text-slate-400">Unknown</span>
              )}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Install Date
            </p>
            <p className="text-sm text-slate-200">
              {primary.installDate || 'Unknown'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Timezone
            </p>
            <p className="text-sm text-slate-200">
              {primary.timezone || 'N/A'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Type
            </p>
            <p className="text-sm text-slate-200">
              {primary.typeName || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Other plants (if any) in smaller cards */}
      {others.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Other Power Stations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {others.map((p) => (
              <div
                key={p.psId}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm"
              >
                <h4 className="text-base font-semibold mb-1">{p.name}</h4>
                <p className="text-xs text-slate-500 mb-2">ID: {p.psId}</p>

                <div className="space-y-1">
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
                    <span className="text-xs">
                      {p.installDate || 'Unknown install date'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
