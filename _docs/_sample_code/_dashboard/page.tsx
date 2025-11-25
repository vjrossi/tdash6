import { getVehicles } from '@/app/actions';
import { VehicleCard } from '@/components/VehicleCard';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { LogoutButton } from '@/components/LogoutButton';
import { Vehicle } from '@/lib/types';
import Link from 'next/link';

export default async function DashboardPage() {
    const vehicles: Vehicle[] | null = await getVehicles();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-cyan-400">T-Dash</h1>
                <div className="flex items-center space-x-4">
                    <LogoutButton />
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6 text-white">My Vehicles</h2>
                
                {!vehicles && (
                    <ErrorDisplay 
                        title="Could Not Load Vehicles"
                        message="There was an issue fetching vehicle data. This could be a network issue or a problem with the Tesla API."
                        recommendation="If you are in development mode, make sure test mode is enabled. Otherwise, please try again later."
                    />
                )}

                {vehicles && vehicles.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No vehicles were found for your account.</p>
                    </div>
                )}

                {vehicles && vehicles.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {vehicles.map((vehicle: Vehicle) => (
                            <VehicleCard key={vehicle.id_s} vehicle={vehicle} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
