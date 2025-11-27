"use client";

import { getVehicles, getVehicleData, logout } from '@/app/actions';
import { VehicleCard } from '@/app/components/VehicleCard';
import { Vehicle } from '@/lib/types';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

function LogoutButton() {
    return (
        <form action={logout}>
            <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </button>
        </form>
    );
}

export default function DashboardPage() {
    const [vehiclesWithData, setVehiclesWithData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVehicleData = async () => {
        setLoading(true);
        setError(null);
        try {
            const vehicles: Vehicle[] | null = await getVehicles();

            if (vehicles) {
                const vehicleDataPromises = vehicles.map(v => getVehicleData(v.id_s));
                const vehicleDataResults = await Promise.all(vehicleDataPromises);

                const newVehiclesWithData = vehicles.map((vehicle, index) => {
                    const dataResult = vehicleDataResults[index];
                    return {
                        ...vehicle,
                        vehicle_data: dataResult.success ? dataResult.data : null,
                        error: !dataResult.success ? dataResult.error : null,
                    };
                });
                setVehiclesWithData(newVehiclesWithData);
            } else {
                setVehiclesWithData([]);
                setError("No vehicles were found for your account, or there was an error fetching data.");
            }
        } catch (e) {
            setError("An unexpected error occurred while fetching vehicle data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicleData();
    }, []);

    const handleRefresh = async () => {
        await fetchVehicleData();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-cyan-400">T-Dash</h1>
                <LogoutButton />
            </header>

            <main className="w-full max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">Loading vehicle data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Try Again
                        </button>
                    </div>
                ) : vehiclesWithData.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {vehiclesWithData.map((vehicle) => (
                            <VehicleCard key={vehicle.id_s} vehicle={vehicle} onRefresh={handleRefresh} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No vehicles were found for your account.</p>
                    </div>
                )}
            </main>
        </div>
    );
}