import {
  Leaf,
  MapPin,
  Power,
  Clock,
  Zap,
  Sun,
  Server
} from 'lucide-react';
import type { SungrowPlantBasicInfo, SungrowRealtimeMetrics } from '@/app/sungrow/actions';

interface PlantCardProps {
  plant: SungrowPlantBasicInfo;
  metrics: SungrowRealtimeMetrics | null;
}

export function PlantCard({ plant, metrics }: PlantCardProps) {
  // Formatters
  const livePowerKW = metrics?.livePowerW != null ? (metrics.livePowerW / 1000).toFixed(2) : null;
  const dailyYieldKWH = metrics?.dailyYieldWh != null ? (metrics.dailyYieldWh / 1000).toFixed(2) : null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800/50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="h-5 w-5 text-emerald-400" />
            <h3 className="text-2xl font-bold text-emerald-400">{plant.name}</h3>
          </div>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            <Server className="h-3 w-3" /> ID: {plant.psId}
          </p>
        </div>
        
        {/* Live Status Badge */}
        <div className="flex flex-col items-end">
           <span className={`text-xs font-medium px-2 py-1 rounded-full ${plant.faultStatus === 1 ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
              {plant.faultStatus === 1 ? 'FAULT' : 'ONLINE'}
           </span>
        </div>
      </div>

      {/* Main Metrics - Hero Section */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Real-Time Output</h4>
            <span className="text-[10px] text-gray-500">Updated ~5min</span>
        </div>
        
        <div className="flex items-baseline gap-2">
            <Zap className="h-8 w-8 text-yellow-400" />
            <span className="text-4xl font-bold text-white">
                {livePowerKW !== null ? livePowerKW : '---'}
            </span>
            <span className="text-xl text-gray-400">kW</span>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="p-6 grid grid-cols-2 gap-4 flex-grow">
        
        {/* Daily Yield */}
        <div className="bg-gray-800 p-3 rounded-lg flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
                <Sun className="h-4 w-4 text-orange-400" />
                <span className="text-xs text-gray-400">Daily Yield</span>
            </div>
            <p className="text-lg font-semibold text-white">
                {dailyYieldKWH !== null ? dailyYieldKWH : '-'} <span className="text-sm text-gray-500">kWh</span>
            </p>
        </div>

        {/* Capacity */}
        <div className="bg-gray-800 p-3 rounded-lg flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
                <Power className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-gray-400">Capacity</span>
            </div>
            <p className="text-lg font-semibold text-white">
                {plant.capacityKw ?? '-'} <span className="text-sm text-gray-500">kW</span>
            </p>
        </div>

        {/* Location */}
        <div className="bg-gray-800 p-3 rounded-lg flex flex-col justify-center col-span-2">
            <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Location</span>
            </div>
            <p className="text-sm font-medium text-white truncate">
                {plant.location || 'Unknown'}
            </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-900/30 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Installed: {plant.installDate || 'N/A'}</span>
        </div>
        <span>{plant.typeName}</span>
      </div>
    </div>
  );
}