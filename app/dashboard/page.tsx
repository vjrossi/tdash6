'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, RefreshCw } from 'lucide-react';

// Tesla Imports
import {
  getVehicles,
  getVehicleData,
  disconnect as teslaDisconnect,
  getAccessToken as getTeslaToken,
} from '@/app/actions';
import { VehicleCard } from '@/app/components/VehicleCard';
import type { Vehicle } from '@/lib/types';

// Sungrow Imports
import {
  getTokens as getSungrowTokens,
  disconnect as sungrowDisconnect,
  getSungrowPlantDetails,
  getSungrowRealtimeMetrics,
  type SungrowPlantBasicInfo,
  type SungrowRealtimeMetrics,
} from '@/app/sungrow/actions';
import { PlantCard } from '@/app/components/PlantCard';

// --- Types ---

type VehicleWithData = Vehicle & {
  vehicle_data: any | null;
  error: string | null;
};

interface DashboardState {
  teslaConnected: boolean;
  sungrowConnected: boolean;
  loading: boolean;
}

export default function UnifiedDashboard() {
  const router = useRouter();
  
  // State
  const [status, setStatus] = useState<DashboardState>({ teslaConnected: false, sungrowConnected: false, loading: true });
  
  // Data
  const [vehicles, setVehicles] = useState<VehicleWithData[]>([]);
  const [plants, setPlants] = useState<SungrowPlantBasicInfo[]>([]);
  const [plantMetrics, setPlantMetrics] = useState<Record<string, SungrowRealtimeMetrics | null>>({});

  // Prevent double fetch
  const hasFetched = useRef(false);

  // --- Auth Handlers ---

  const handleTeslaLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_TESLA_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/callback`;
    const scope = 'openid vehicle_device_data vehicle_cmds vehicle_charging_cmds';
    const responseType = 'code';
    const state = 'dashboard_connect';

    window.location.href = `https://auth.tesla.com/oauth2/v3/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;
  };

  const handleSungrowLogin = () => {
    window.location.href = `https://auweb3.isolarcloud.com/#/authorized-app?cloudId=7&applicationId=583&redirectUrl=${process.env.NEXT_PUBLIC_SUNGROW_REDIRECT_URL}`;
  };

  const handleGlobalLogout = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    
    // Execute both disconnects in parallel without redirecting
    await Promise.all([
      teslaDisconnect(),
      sungrowDisconnect()
    ]);

    // Refresh the router cache and reload data to show empty state
    router.refresh();
    await loadData();
  };

  // --- Data Fetching ---

  const loadData = async () => {
    setStatus(prev => ({ ...prev, loading: true }));

    // 1. Check/Fetch Tesla
    const teslaToken = await getTeslaToken();
    const isTeslaConnected = !!teslaToken;
    let newVehicles: VehicleWithData[] = [];

    if (isTeslaConnected) {
      try {
        const vehicleList: Vehicle[] | null = await getVehicles();
        if (vehicleList) {
          const dataPromises = vehicleList.map(v => getVehicleData(v.id_s));
          const results = await Promise.all(dataPromises);
          
          newVehicles = vehicleList.map((v, i) => ({
            ...v,
            vehicle_data: results[i].success ? results[i].data : null,
            error: !results[i].success ? results[i].error : null
          }));
        }
      } catch (e) {
        console.error("Tesla fetch error", e);
      }
    }

    // 2. Check/Fetch Sungrow
    const sungrowTokens = await getSungrowTokens();
    const isSungrowConnected = !!sungrowTokens.accessToken;
    let newPlants: SungrowPlantBasicInfo[] = [];
    let newMetrics: Record<string, SungrowRealtimeMetrics | null> = {};

    if (isSungrowConnected) {
      try {
        newPlants = await getSungrowPlantDetails();
        // Fetch metrics for the first plant (primary)
        if (newPlants.length > 0) {
          const pid = newPlants[0].psId.toString();
          const metrics = await getSungrowRealtimeMetrics(pid);
          newMetrics[pid] = metrics;
        }
      } catch (e) {
        console.error("Sungrow fetch error", e);
      }
    }

    setVehicles(newVehicles);
    setPlants(newPlants);
    setPlantMetrics(newMetrics);
    
    setStatus({
      teslaConnected: isTeslaConnected,
      sungrowConnected: isSungrowConnected,
      loading: false
    });
  };

  // Initial Load
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadData();
  }, []);

  // Tesla specific refresh handler passed to VehicleCard
  const handleTeslaRefresh = async (vehicleId: string) => {
    const res = await getVehicleData(vehicleId);
    setVehicles(prev => prev.map(v => 
      v.id_s === vehicleId 
        ? { ...v, vehicle_data: res.success ? res.data : null, error: !res.success ? res.error : null }
        : v
    ));
  };

  // --- Render ---

  if (status.loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-500" />
          <p>Syncing Energy Assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Overview of your connected energy assets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2 mr-2">
              <span className={`h-2 w-2 rounded-full mt-2 ${status.teslaConnected ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-slate-700'}`} title="Tesla Status" />
              <span className={`h-2 w-2 rounded-full mt-2 ${status.sungrowConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-700'}`} title="Sungrow Status" />
            </div>
            
            <button 
              onClick={handleGlobalLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-red-950/30 hover:border-red-900/50 hover:text-red-400 rounded-full transition-all text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* 1. Tesla Vehicles */}
          {status.teslaConnected && vehicles.length > 0 && (
            vehicles.map(v => (
              <VehicleCard 
                key={v.id_s} 
                vehicle={v} 
                onRefresh={() => handleTeslaRefresh(v.id_s)} 
              />
            ))
          )}

          {/* 2. Sungrow Plants */}
          {status.sungrowConnected && plants.length > 0 && (
            plants.map(p => (
              <PlantCard 
                key={p.psId} 
                plant={p} 
                metrics={plantMetrics[p.psId.toString()] || null} 
              />
            ))
          )}

          {/* 3. Empty State / Add Connection Cards */}
          
          {!status.teslaConnected && (
            <div 
              onClick={handleTeslaLogin}
              className="group cursor-pointer border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/20 hover:bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center p-8 min-h-[300px] transition-all"
            >
              <div className="h-16 w-16 rounded-full bg-slate-800 group-hover:bg-cyan-900/30 flex items-center justify-center mb-4 transition-colors">
                <Plus className="h-8 w-8 text-slate-600 group-hover:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-400 group-hover:text-cyan-100">Connect Tesla</h3>
              <p className="text-sm text-slate-500 text-center mt-2 px-4">
                Add your vehicle to view battery, climate, and location data.
              </p>
            </div>
          )}

          {!status.sungrowConnected && (
            <div 
              onClick={handleSungrowLogin}
              className="group cursor-pointer border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-900/20 hover:bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center p-8 min-h-[300px] transition-all"
            >
              <div className="h-16 w-16 rounded-full bg-slate-800 group-hover:bg-emerald-900/30 flex items-center justify-center mb-4 transition-colors">
                <Plus className="h-8 w-8 text-slate-600 group-hover:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-400 group-hover:text-emerald-100">Connect Sungrow</h3>
              <p className="text-sm text-slate-500 text-center mt-2 px-4">
                Add your solar inverter to view generation and yield data.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}