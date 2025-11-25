import { getVehicles } from "@/app/actions";
import Link from "next/link";

export default async function VehicleList() {
    const vehicles = await getVehicles();

    if (!vehicles) {
        return <p>Could not retrieve vehicles. Please try again later.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle: any) => (
                <div key={vehicle.id_s} className="p-6 border border-zinc-200 rounded-lg dark:border-zinc-800 hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-semibold mb-2">{vehicle.display_name}</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">VIN: {vehicle.vin}</p>
                    <Link href={`/dashboard/${vehicle.id_s}`} className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        View Details
                    </Link>
                </div>
            ))}
        </div>
    );
}
