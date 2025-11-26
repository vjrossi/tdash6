'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/lib/types';
import { getVehicleData } from '@/app/actions';

interface VehicleCardProps {
    vehicle: Vehicle;
}

export function VehicleCard({ vehicle: initialVehicle }: VehicleCardProps) {
    const [vehicle, setVehicle] = useState(initialVehicle);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch_vehicle_data = async () => {
        setLoading(true);
        setError(null);
        const result = await getVehicleData(vehicle.id_s);
        if (result.success) {
            setVehicle(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetch_vehicle_data();
    }, []);

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition-colors duration-300 ease-in-out">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-cyan-400">{vehicle.display_name}</h3>
                    <p className="text-gray-400">{vehicle.vin}</p>
                </div>
                <button 
                    onClick={fetch_vehicle_data}
                    disabled={loading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            <div className="mt-4 text-sm">
                <p className="font-semibold text-white">State:</p>
                <p className="text-gray-300">{vehicle.state}</p>
            </div>

            {vehicle.vehicle_state?.tpms_pressure_fl !== undefined && (
                 <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-white">Tire Pressure:</p>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <p>FL: {vehicle.vehicle_state.tpms_pressure_fl}</p>
                            <p>FR: {vehicle.vehicle_state.tpms_pressure_fr}</p>
                            <p>RL: {vehicle.vehicle_state.tpms_pressure_rl}</p>
                            <p>RR: {vehicle.vehicle_state.tpms_pressure_rr}</p>
                        </div>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}

