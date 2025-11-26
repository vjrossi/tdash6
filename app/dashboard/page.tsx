import { getVehicles, getVehicleData, logout } from '@/app/actions';
import { VehicleCard } from '@/app/components/VehicleCard';
import { Vehicle } from '@/lib/types';
import { LogOut } from 'lucide-react';

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

export default async function DashboardPage() {
    const vehicles: Vehicle[] | null = await getVehicles();

    // If we have vehicles, fetch the detailed data for each one in parallel
    const vehicleDataPromises = vehicles ? vehicles.map(v => getVehicleData(v.id_s)) : [];
    const vehicleDataResults = await Promise.all(vehicleDataPromises);

    const vehiclesWithData = vehicles ? vehicles.map((vehicle, index) => {
        const dataResult = vehicleDataResults[index];
        return {
            ...vehicle,
            vehicle_data: dataResult.success ? dataResult.data : null,
            error: !dataResult.success ? dataResult.error : null,
        };
    }) : [];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-cyan-400">T-Dash</h1>
                <LogoutButton />
            </header>

            <main className="w-full max-w-7xl mx-auto">
                {vehiclesWithData.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {vehiclesWithData.map((vehicle) => (
                            <VehicleCard key={vehicle.id_s} vehicle={vehicle} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No vehicles were found for your account, or there was an error fetching data.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
