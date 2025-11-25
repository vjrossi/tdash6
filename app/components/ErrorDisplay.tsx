'use client';

interface ErrorDisplayProps {
    title: string;
    message: string;
    recommendation?: string;
}

export function ErrorDisplay({ title, message, recommendation }: ErrorDisplayProps) {
    return (
        <div className="bg-gray-800 border border-red-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-red-500 mb-3">{title}</h3>
            <p className="text-gray-300 mb-4">{message}</p>
            {recommendation && (
                <p className="text-sm text-gray-400">
                    <span className="font-semibold">Recommendation: </span>
                    {recommendation}
                </p>
            )}
        </div>
    );
}
