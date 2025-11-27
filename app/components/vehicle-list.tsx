"use client";

import { getVehicles } from "@/app/actions";
import { VehicleCard } from "./VehicleCard";
import { Vehicle } from "@/lib/types";
import { useEffect, useState } from "react";

export default function VehicleList() {
    const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refreshVehicles = async () => {
        try {
            const refreshedVehicles = await getVehicles();
            if (refreshedVehicles) {
                setVehicles(refreshedVehicles);
                setError(null);
            } else {
                setError("Could not retrieve vehicles. Please try again later.");
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again later.");
        }
    };

    useEffect(() => {
        refreshVehicles();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={refreshVehicles}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!vehicles) {
        return <p>Loading vehicles...</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle: Vehicle) => (
                <VehicleCard key={vehicle.id_s} vehicle={vehicle} onRefresh={refreshVehicles} />
            ))}
        </div>
    );
}