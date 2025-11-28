'use client';

import { Vehicle } from '@/lib/types';
import {
    BatteryCharging, Thermometer, ShieldCheck,
    MapPin, Gauge, Fan, Snowflake, Sun, ParkingCircle, RefreshCw, PowerOff, Plug
} from 'lucide-react';
import { useState } from 'react';

// Import new charge control actions
import { startCharge, stopCharge } from '@/app/actions'; 

// --- PROPS AND UTILS ---

interface VehicleCardProps {
    vehicle: Vehicle;
    onRefresh: (vehicleId: string) => Promise<void>;
}

const barToPsi = (bar: number) => Math.round(bar * 14.5038);
const milesToKm = (miles: number) => Math.round(miles * 1.60934);

// --- SUB-COMPONENTS ---

// A single, unified component for displaying an icon and its corresponding value.
const DataPoint = ({ icon: Icon, label, value, unit = '' }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    unit?: string;
}) => (
    <div className="flex items-center bg-gray-800 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-cyan-400 mr-3" />
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-lg font-semibold text-white">
                {value} <span className="text-sm text-gray-300">{unit}</span>
            </p>
        </div>
    </div>
);

// A circular progress bar for visualizing the battery's state of charge.
const CircularProgress = ({ value }: { value: number }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-32 h-32">
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="64" cy="64" />
                <circle
                    className="text-cyan-500"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="64"                    cy="64"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white">{value}</span>
                <span className="text-lg text-gray-400">%</span>
            </div>
        </div>
    );
};

// Displays the pressure for a single tyre.
const TyrePressure = ({ label, pressure }: { label: string; pressure?: number }) => (
    <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{pressure ? barToPsi(pressure) : '-'}</p>
        <p className="text-xs text-gray-500">PSI</p>
    </div>
);

// --- MAIN COMPONENT ---

export function VehicleCard({ vehicle, onRefresh }: VehicleCardProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    // NEW: State for command execution feedback
    const [commandStatus, setCommandStatus] = useState<{ message: string; isError: boolean } | null>(null);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Pass vehicle.id_s to onRefresh as it's typically what the parent handler expects
            await onRefresh(vehicle.id_s); 
        } finally {
            setIsRefreshing(false);
            setCommandStatus(null); // Clear status on manual refresh
        }
    };
    
    // NEW: Generic command handler
    const handleCommand = async (command: 'start' | 'stop') => {
        setCommandStatus(null);
        setIsRefreshing(true); 
        
        const action = command === 'start' ? startCharge : stopCharge;
        
        try {
            const result = await action(vehicle.id_s);
            
            if (result.success) {
                setCommandStatus({ 
                    message: command === 'start' ? 'Charge started successfully.' : 'Charge stopped successfully.',
                    isError: false 
                });
                // After command, trigger a refresh to update status immediately
                await onRefresh(vehicle.id_s);
            } else {
                setCommandStatus({ 
                    message: result.error || `Failed to send ${command} command.`, 
                    isError: true 
                });
                // Important: Even if command fails, try to refresh vehicle data
                await onRefresh(vehicle.id_s); 
            }
        } catch (e: any) {
            setCommandStatus({ 
                message: `An unexpected error occurred: ${e.message}`, 
                isError: true 
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    // Offline/Asleep State
    if (vehicle.error || !vehicle.vehicle_data) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/20">
                <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800/50 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-cyan-400">{vehicle.display_name}</h3>
                        <p className="text-gray-400 text-sm">{vehicle.vin}</p>
                    </div>
                    <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="p-12 flex flex-col justify-center items-center text-center">
                    <PowerOff className="h-16 w-16 text-gray-500 mb-4" />
                    <p className="text-xl font-semibold text-white">Vehicle Offline</p>
                    <p className="text-gray-400">{vehicle.error || "Could not connect to the vehicle."}</p>
                    
                     {/* NEW: Command Status Display for Offline state */}
                    {commandStatus && (
                        <div className={`mt-4 w-full p-3 rounded-lg text-sm font-medium ${commandStatus.isError ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                            {commandStatus.message}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const { charge_state, climate_state, vehicle_state, drive_state } = vehicle.vehicle_data;

    const isCharging = charge_state.charging_state === 'Charging';
    const isPluggedIn = charge_state.charging_state !== 'Disconnected';
    const climateStatus = climate_state.is_climate_on ? (climate_state.fan_status > 0 ? 'On' : 'Standby') : 'Off';
    
    // Logic for button state
    const canStart = isPluggedIn && !isCharging;
    const canStop = isCharging;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/20">
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800/50 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-cyan-400">{vehicle.display_name}</h3>
                    <p className="text-gray-400 text-sm">{vehicle.vin}</p>
                </div>
                <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            {/* NEW: Charging Controls Section */}
            <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                        <Plug className="h-5 w-5 mr-2 text-cyan-400" />
                        Charging Controls
                    </h4>
                    <p className={`text-xs font-medium px-2 py-1 rounded-full ${isPluggedIn ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'}`}>
                        {isPluggedIn ? 'PLUGGED IN' : 'DISCONNECTED'}
                    </p>
                </div>
                
                {/* Status Message */}
                {commandStatus && (
                    <div className={`mb-3 p-3 rounded-lg text-sm font-medium ${commandStatus.isError ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                        {commandStatus.message}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleCommand('start')}
                        disabled={!canStart || isRefreshing}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            canStart && !isRefreshing
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-70'
                        }`}
                    >
                        {isCharging ? 'CHARGING' : 'START CHARGE'}
                    </button>
                    <button
                        onClick={() => handleCommand('stop')}
                        disabled={!canStop || isRefreshing}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            canStop && !isRefreshing
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-70'
                        }`}
                    >
                        STOP CHARGE
                    </button>
                </div>
            </div>


            {/* Main Data Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Battery Status */}
                <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
                    <h4 className="text-lg font-semibold text-white mb-3">Battery</h4>
                    <CircularProgress value={charge_state.battery_level} />
                    <div className="mt-4 flex items-center text-lg">
                        {isCharging && <BatteryCharging className="h-6 w-6 text-green-400 mr-2" />}
                        <p>{isCharging ? 'Charging' : 'Standby'}</p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{milesToKm(charge_state.battery_range)} km remaining</p>
                </div>

                {/* Climate & Tyres */}
                <div className="md:col-span-2 space-y-6">
                    {/* Climate */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Climate</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <DataPoint icon={Thermometer} label="Interior Temp" value={climate_state.inside_temp} unit="°C" />
                            <DataPoint icon={Sun} label="Exterior Temp" value={climate_state.outside_temp} unit="°C" />
                            <DataPoint icon={Fan} label="Fan Speed" value={climate_state.fan_status || 'Off'} />
                            <DataPoint icon={Snowflake} label="Climate" value={climateStatus} />
                        </div>
                    </div>

                    {/* Tyre Pressures */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Tyre Pressures</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <TyrePressure label="Front Left" pressure={vehicle_state.tpms_pressure_fl} />
                            <TyrePressure label="Front Right" pressure={vehicle_state.tpms_pressure_fr} />
                            <TyrePressure label="Rear Left" pressure={vehicle_state.tpms_pressure_rl} />
                            <TyrePressure label="Rear Right" pressure={vehicle_state.tpms_pressure_rr} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Data */}
            <div className="p-6 border-t border-gray-700/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                <DataPoint icon={Gauge} label="Odometer" value={milesToKm(vehicle_state.odometer).toLocaleString()} unit="km" />
                <DataPoint icon={ParkingCircle} label="Gear" value={drive_state?.shift_state || 'P'} />
                <DataPoint icon={ShieldCheck} label="Sentry Mode" value={vehicle_state.sentry_mode ? 'On' : 'Off'} />
                <DataPoint icon={MapPin} label="Location" value={drive_state?.latitude ? 'Available' : 'Unavailable'} />
            </div>
        </div>
    );
}