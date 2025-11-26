import { getVehicles } from "@/app/actions";
import { VehicleCard } from "./VehicleCard";
import { Vehicle } from "@/lib/types";

export default async function VehicleList() {
    const vehicles = await getVehicles();

    if (!vehicles) {
        return <p>Could not retrieve vehicles. Please try again later.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle: Vehicle) => (
                <VehicleCard key={vehicle.id_s} vehicle={vehicle} />
            ))}
        </div>
    );
}
