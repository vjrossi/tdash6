'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SUNGROW_APP_KEY, SUNGROW_SECRET_KEY, SUNGROW_BASE_URL, SUNGROW_ENDPOINT_TOKEN, SUNGROW_REDIRECT_URL } from '@/lib/sungrow-config';

// --- AUTHENTICATION ACTIONS ---

export async function getTokens() {
    const accessToken = (await cookies()).get('sungrow_access_token')?.value;
    const refreshToken = (await cookies()).get('sungrow_refresh_token')?.value;
    return { accessToken, refreshToken };
}

export async function getSungrowPsList() {
    const psListCookie = (await cookies()).get('sungrow_ps_list')?.value;
    if (!psListCookie) return [];
    try {
        return JSON.parse(psListCookie);
    } catch (e) {
        console.error('Error parsing ps_list cookie:', e);
        return [];
    }
}

export async function logout() {
    (await cookies()).delete('sungrow_access_token');
    (await cookies()).delete('sungrow_refresh_token');
    (await cookies()).delete('sungrow_ps_list');
    redirect('/');
}

export async function getSungrowToken(code: string): Promise<{ success: boolean; error?: string }> {
  if (!SUNGROW_APP_KEY || !SUNGROW_SECRET_KEY || !SUNGROW_REDIRECT_URL || !SUNGROW_ENDPOINT_TOKEN || !SUNGROW_BASE_URL) {
    const errorMessage = 'Server configuration error: Sungrow env vars missing.';
    return { success: false, error: errorMessage };
  }

  const requestBody = {
    grant_type: 'authorization_code',
    appkey: SUNGROW_APP_KEY,
    code,
    redirect_uri: SUNGROW_REDIRECT_URL,
  };

  const requestHeaders = {
    'Content-Type': 'application/json',
    'x-access-key': SUNGROW_SECRET_KEY,
    Accept: '*/*',
  };

  try {
    const response = await fetch(`${SUNGROW_BASE_URL}${SUNGROW_ENDPOINT_TOKEN}`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return { success: false, error: `Sungrow API failed with HTTP ${response.status}` };
    }

    const data = JSON.parse(responseText);

    if (data.result_code !== '1') {
      return { success: false, error: `Sungrow API error: ${data.result_msg || data.result_code}` };
    }

    const { access_token, refresh_token, expires_in, auth_ps_list } = data.result_data;
    
    const secure = process.env.NODE_ENV === 'production';
    const cookieOptions = { httpOnly: true, secure, path: '/' };

    const cookieStore = await cookies();
    cookieStore.set('sungrow_access_token', access_token, { ...cookieOptions, maxAge: expires_in });
    cookieStore.set('sungrow_refresh_token', refresh_token, { ...cookieOptions });
    cookieStore.set('sungrow_ps_list', JSON.stringify(auth_ps_list), { ...cookieOptions });

    return { success: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
