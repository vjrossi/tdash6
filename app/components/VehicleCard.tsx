'use client';

import { Vehicle } from '@/lib/types';
import Link from 'next/link';

interface VehicleCardProps {
    vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
    return (
        <Link href={`/dashboard/${vehicle.id_s}`}>
            <div className="block bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 ease-in-out p-6">
                <h3 className="text-xl font-bold text-cyan-400">{vehicle.display_name}</h3>
                <p className="text-gray-400">{vehicle.vin}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-white">State:</p>
                        <p className="text-gray-300">{vehicle.state}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-white">Battery:</p>
                        <p className="text-gray-300">{vehicle.charge_state.battery_level}%</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
