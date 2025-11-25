'use client';

import { Vehicle } from '@/lib/types';

interface VehicleCardProps {
    vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-cyan-400">{vehicle.display_name}</h3>
            <p className="text-gray-400">{vehicle.vin}</p>
            <div className="mt-4 text-sm">
                <p className="font-semibold text-white">State:</p>
                <p className="text-gray-300">{vehicle.state}</p>
            </div>
        </div>
    );
}
