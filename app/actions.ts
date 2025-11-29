'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// --- CONFIGURATION ---
const TESLA_CLOUD_URL = 'https://fleet-api.prd.na.vn.cloud.tesla.com';

// --- DEBUG ACTION ---
export async function debugServerEnv() {
  console.log("\n====== SERVER ENVIRONMENT DEBUG ======");
  console.log("NEXT_PUBLIC_TESLA_API_BASE_URL:", process.env.NEXT_PUBLIC_TESLA_API_BASE_URL || "MISSING");
  console.log("======================================\n");
  return { success: true };
}

// --- AUTH HELPERS ---

export async function getAccessToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tesla_access_token');
  return token?.value;
}

async function setAuthCookie(token: string, expiresIn: number) {
  const cookieStore = await cookies();
  cookieStore.set('tesla_access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: expiresIn,
  });
}

async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('tesla_access_token');
}

const exchangeSchema = z.object({
  code: z.string(),
});

// --- AUTH ACTIONS ---

export async function exchangeCodeForToken(code: string) {
  const validation = exchangeSchema.safeParse({ code });

  if (!validation.success) {
    return { success: false, error: 'Invalid authorization code.' };
  }

  // 1. APPLY YOUR FIX: Manually append $i
  const secret = `${process.env.TESLA_CLIENT_SECRET}$i`;

  try {
    const response = await fetch('https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
        client_secret: secret, // Using your manual fix
        code: validation.data.code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
        audience: TESLA_CLOUD_URL // Required!
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Tesla Auth Failed:", data);
      return { success: false, error: data.error_description || 'Authentication failed.' };
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

export async function disconnect() {
  await deleteAuthCookie();
  return { success: true };
}

// --- VEHICLE ACTIONS (READ) ---
// ⚠️ FIX: These now hit TESLA_CLOUD_URL directly to avoid Proxy errors

export async function getVehicles() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    // Reading list from Cloud (Reliable)
    const response = await fetch(`${TESLA_CLOUD_URL}/api/1/vehicles`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
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
  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false, error: "Unauthorized" };

  try {
    // Check status from Cloud
    const initialResponse = await fetch(`${TESLA_CLOUD_URL}/api/1/vehicles/${vehicleId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!initialResponse.ok) return { success: false, error: "Failed to fetch status" };
    const vehicle = (await initialResponse.json()).response;

    if (vehicle.state !== 'online') {
      return { success: false, error: `Vehicle is ${vehicle.state}` };
    }

    // Get data from Cloud
    const response = await fetch(`${TESLA_CLOUD_URL}/api/1/vehicles/${vehicleId}/vehicle_data`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      cache: 'no-store', 
    });

    if (!response.ok) return { success: false, error: "API Error" };
    
    const data = await response.json();
    return { success: true, data: data.response };

  } catch (error) {
    return { success: false, error: "Network Error" };
  }
}

// --- VEHICLE COMMANDS (WRITE) ---
// ⚠️ FIX: Only commands go through the Proxy

async function sendVehicleCommand(vehicleId: string, command: string) {
  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false, error: "Unauthorized" };

  // Use the local proxy URL from environment for signing
  const proxyUrl = process.env.NEXT_PUBLIC_TESLA_API_BASE_URL;
  if (!proxyUrl) return { success: false, error: "Proxy URL not configured" };

  const url = `${proxyUrl}/api/1/vehicles/${vehicleId}/command/${command}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}), 
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || `Proxy Error ${response.status}` };
    }

    if (data.response?.result !== true) {
      return { success: false, error: data.response?.reason || 'Command failed' };
    }

    return { success: true };

  } catch (error) {
    console.error(`Command ${command} error:`, error);
    return { success: false, error: "Proxy Connection Failed" };
  }
}

export async function startCharge(vehicleId: string) {
  return sendVehicleCommand(vehicleId, 'charge_start');
}

export async function stopCharge(vehicleId: string) {
  return sendVehicleCommand(vehicleId, 'charge_stop');
}