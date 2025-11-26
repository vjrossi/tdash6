'use client';

import { Vehicle } from '@/lib/types';
import {
    BatteryCharging, Thermometer, ShieldCheck,
    MapPin, Gauge, Fan, Snowflake, Sun, ParkingCircle
} from 'lucide-react';

interface VehicleCardProps {
    vehicle: Vehicle;
}

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
    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-32 h-32">
                <circle
                    className="text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="64"
                    cy="64"
                />
                <circle
                    className="text-cyan-500"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="64"
                    cy="64"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white">{value}</span>
                <span className="text-lg text-gray-400">%</span>
            </div>
        </div>
    );
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
    if (vehicle.error || !vehicle.vehicle_data) {
        return (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-center items-center text-center">
                <h3 className="text-xl font-bold text-cyan-400">{vehicle.display_name}</h3>
                <p className="text-gray-400 text-sm mb-4">{vehicle.vin}</p>
                <p className="text-red-500">Could not load vehicle data.</p>
                <p className="text-gray-500 text-sm">{vehicle.error}</p>
            </div>
        );
    }

    const { vehicle_data } = vehicle;
    const { charge_state, climate_state, vehicle_state, drive_state } = vehicle_data;

    const isCharging = charge_state.charging_state === 'Charging';
    const climateStatus = climate_state.is_climate_on ? (climate_state.fan_status > 0 ? 'On' : 'Standby') : 'Off';

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/20">
            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800/50">
                <h3 className="text-2xl font-bold text-cyan-400">{vehicle.display_name}</h3>
                <p className="text-gray-400 text-sm">{vehicle.vin}</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Battery Status */}
                <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
                    <h4 className="text-lg font-semibold text-white mb-3">Battery</h4>
                    <CircularProgress value={charge_state.battery_level} />
                    <div className="mt-4 flex items-center text-lg">
                        {isCharging && <BatteryCharging className="h-6 w-6 text-green-400 mr-2" />}
                        <p>{isCharging ? 'Charging' : 'Standby'}</p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{charge_state.battery_range} miles remaining</p>
                </div>

                {/* Climate Controls */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <DataPoint icon={Thermometer} label="Interior Temp" value={climate_state.inside_temp} unit="°C" />
                    <DataPoint icon={Sun} label="Exterior Temp" value={climate_state.outside_temp} unit="°C" />
                    <DataPoint icon={Fan} label="Fan Speed" value={climate_state.fan_status || 'Off'} />
                    <DataPoint icon={Snowflake} label="Climate" value={climateStatus} />
                </div>
            </div>

            <div className="p-6 border-t border-gray-700/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                <DataPoint icon={Gauge} label="Odometer" value={Math.round(vehicle_state.odometer).toLocaleString()} unit="mi" />
                <DataPoint icon={ParkingCircle} label="Gear" value={drive_state.shift_state || 'P'} />
                <DataPoint icon={ShieldCheck} label="Sentry Mode" value={vehicle_state.sentry_mode ? 'On' : 'Off'} />
                <DataPoint icon={MapPin} label="Location" value={drive_state.latitude ? 'Available' : 'Unavailable'} />
            </div>
        </div>
    );
}
