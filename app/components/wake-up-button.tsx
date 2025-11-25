'use client';

import { useState } from 'react';
import { wakeUpVehicle } from '@/app/actions';

export default function WakeUpButton({ vehicleId }: { vehicleId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleWakeUp = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const result = await wakeUpVehicle(vehicleId);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'An unknown error occurred.');
        }

        setIsLoading(false);
    };

    return (
        <div>
            <button
                onClick={handleWakeUp}
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-5 text-white transition-colors hover:bg-blue-600 disabled:bg-zinc-400 md:w-[200px]"
            >
                {isLoading ? 'Waking Up...' : 'Wake Up'}
            </button>
            {error && <p className="mt-2 text-red-500">{error}</p>}
            {success && <p className="mt-2 text-green-500">Vehicle is now online!</p>}
        </div>
    );
}
