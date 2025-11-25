import { getVehicleData } from "@/app/actions";
import WakeUpButton from "@/app/components/wake-up-button";
import Link from "next/link";

export default async function VehicleDetailsPage({ params }: { params: { vehicleId: string } }) {
    const vehicleData = await getVehicleData(params.vehicleId);

    if (!vehicleData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
                <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
                    <h1 className="text-2xl font-semibold">Error</h1>
                    <p>Could not retrieve vehicle data. Please try again later.</p>
                    <div className="mt-4">
                        <Link href="/dashboard" className="text-blue-500 hover:underline">
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-zinc-50 font-sans dark:bg-black">
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">{vehicleData.display_name}</h1>
                    <Link href="/dashboard" className="text-blue-500 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Vehicle State</h2>
                            <div className="space-y-2">
                                <p><span className="font-semibold">State:</span> {vehicleData.state}</p>
                                <p><span className="font-semibold">VIN:</span> {vehicleData.vin}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Charge State</h2>
                            <div className="space-y-2">
                                <p><span className="font-semibold">Battery:</span> {vehicleData.charge_state.battery_level}%</p>
                                <p><span className="font-semibold">Range:</span> {vehicleData.charge_state.battery_range} miles</p>
                                <p><span className="font-semibold">Charging State:</span> {vehicleData.charge_state.charging_state}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Climate State</h2>
                            <div className="space-y-2">
                                <p><span className="font-semibold">Inside Temp:</span> {vehicleData.climate_state.inside_temp}°C</p>
                                <p><span className="font-semibold">Outside Temp:</span> {vehicleData.climate_state.outside_temp}°C</p>
                                <p><span className="font-semibold">HVAC On:</span> {vehicleData.climate_state.is_climate_on ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Actions</h2>
                        <div className="space-y-4">
                           <WakeUpButton vehicleId={params.vehicleId} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
