'use client';

import { logout } from '@/app/actions';

export function LogoutButton() {
    return (
        <form action={logout}>
            <button 
                type="submit"
                className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-colors"
            >
                Logout
            </button>
        </form>
    );
}
