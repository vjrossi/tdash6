'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// --- AUTHENTICATION ACTIONS ---

export async function getAccessToken() {
    const accessToken = (await cookies()).get('tesla_access_token')?.value;
    return accessToken;
}

async function setAuthCookie(token: string, expiresIn: number) {
    (await cookies()).set('tesla_access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: expiresIn,
    });
}

async function deleteAuthCookie() {
    (await cookies()).delete('tesla_access_token');
}

const exchangeSchema = z.object({
  code: z.string(),
});

export async function exchangeCodeForToken(code: string) {
  const validation = exchangeSchema.safeParse({ code });

  if (!validation.success) {
    return { success: false, error: 'Invalid authorization code.' };
  }

  try {
    const response = await fetch('https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
        client_secret: process.env.TESLA_CLIENT_SECRET,
        code: validation.data.code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error_description || 'An unknown error occurred.' };
    }

    await setAuthCookie(data.access_token, data.expires_in);

    return { success: true };

  } catch (error) {
    console.error('Token exchange error:', error);
    return { success: false, error: 'Failed to connect to Tesla servers.' };
  }
}

export async function logout() {
    await deleteAuthCookie();
    redirect('/');
}


// --- VEHICLE ACTIONS ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getVehicle(vehicleId: string, accessToken: string) {
    const baseUrl = process.env.NEXT_PUBLIC_TESLA_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }
    const response = await fetch(`${baseUrl}/api/1/vehicles/${vehicleId}`,
    {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Failed to fetch vehicle status. Status: ${response.status}`);
    }
    const data = await response.json();
    return data.response;
}

export async function getVehicles() {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        console.error("Unauthorized: No access token found");
        return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_TESLA_API_BASE_URL;
    if (!baseUrl) {
        console.error("API base URL is not configured.");
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/api/1/vehicles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: "Unknown API error" }));
            console.error('Get vehicles error:', errorBody);
            return null;
        }

        const data = await response.json();
        return data.response;

    } catch (error) {
        console.error("Get vehicles fetch error:", error);
        return null;
    }
}

export async function getVehicleData(vehicleId: string) {
    const accessToken = (await cookies()).get('tesla_access_token')?.value;
    if (!accessToken) {
        console.error("Unauthorized: No access token found");
        return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_TESLA_API_BASE_URL;
    if (!baseUrl) {
        console.error("API base URL is not configured.");
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/api/1/vehicles/${vehicleId}/vehicle_data?endpoints=vehicle_data_combo`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            cache: 'no-store', // Ensure fresh data
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: "Unknown API error" }));
            console.error('Get vehicle data error:', errorBody);
            return null;
        }
        
        const data = await response.json();
        return data.response;

    } catch (error) {
        console.error("Get vehicle data fetch error:", error);
        return null;
    }
}

export async function wakeUpVehicle(vehicleId: string) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return { success: false, error: "Unauthorized" };
    }

    const baseUrl = process.env.NEXT_PUBLIC_TESLA_API_BASE_URL;
    if (!baseUrl) {
        return { success: false, error: "API base URL is not configured." };
    }

    try {
        // Initial wake up call
        await fetch(`${baseUrl}/api/1/vehicles/${vehicleId}/wake_up`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        const startTime = Date.now();
        const timeout = 30000; // 30 seconds
        let vehicle = null;

        while (Date.now() - startTime < timeout) {
            vehicle = await getVehicle(vehicleId, accessToken);
            if (vehicle.state === 'online') {
                revalidatePath('/dashboard');
                return { success: true, data: vehicle };
            }
            await delay(2000); // Wait 2 seconds before checking again
        }
        
        console.error('Wake up timed out for vehicle:', vehicleId);
        return { success: false, error: "Wake up timed out. The vehicle did not respond."};

    } catch (error) {
        console.error("Wake up error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to wake up vehicle. Reason: ${errorMessage}` };
    }
}
