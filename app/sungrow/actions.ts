'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SUNGROW_APP_KEY,
  SUNGROW_SECRET_KEY,
  SUNGROW_REDIRECT_URL,
  SUNGROW_BASE_URL,
  SUNGROW_ENDPOINT_TOKEN,
  SUNGROW_ENDPOINT_PLANT_INFO,
} from '@/lib/sungrow-config';

//
// TYPES
//

export type SungrowPlantBasicInfo = {
  psId: number;
  name: string;
  typeName: string | null;
  location: string | null;
  onlineStatus: number | null;
  buildStatus: number | null;
  installDate: string | null;
  timezone: string | null;
  capacityKw: number | null;
  faultStatus: number | null;
};

//
// TOKEN & COOKIE HELPERS
//

export async function getTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get('sungrow_access_token')?.value,
    refreshToken: cookieStore.get('sungrow_refresh_token')?.value,
  };
}

export async function getSungrowPsList() {
  const psListCookie = (await cookies()).get('sungrow_ps_list')?.value;
  if (!psListCookie) return [];
  try {
    return JSON.parse(psListCookie) as string[];
  } catch (e) {
    console.error('Error parsing ps_list cookie:', e);
    return [];
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('sungrow_access_token');
  cookieStore.delete('sungrow_refresh_token');
  cookieStore.delete('sungrow_ps_list');
  redirect('/');
}

//
// TOKEN EXCHANGE
//

export async function getSungrowToken(
  code: string,
): Promise<{ success: boolean; error?: string }> {

  if (!SUNGROW_APP_KEY || !SUNGROW_SECRET_KEY || !SUNGROW_REDIRECT_URL) {
    return { success: false, error: 'Missing Sungrow env vars.' };
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
    const url = `${SUNGROW_BASE_URL}${SUNGROW_ENDPOINT_TOKEN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = JSON.parse(text);
    if (data.result_code !== '1') {
      return { success: false, error: data.result_msg || 'API error' };
    }

    const { access_token, refresh_token, expires_in, auth_ps_list } =
      data.result_data;

    const secure = process.env.NODE_ENV === 'production';
    const cookieOptions = { httpOnly: true, secure, path: '/' as const };

    const cookieStore = await cookies();
    cookieStore.set('sungrow_access_token', access_token, {
      ...cookieOptions,
      maxAge: Number(expires_in) || 86400,
    });
    cookieStore.set('sungrow_refresh_token', refresh_token, cookieOptions);
    cookieStore.set('sungrow_ps_list', JSON.stringify(auth_ps_list), cookieOptions);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

//
// NEW: PLANT DETAIL FETCH
//

export async function getSungrowPlantDetails(): Promise<SungrowPlantBasicInfo[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sungrow_access_token')?.value;
  const psListCookie = cookieStore.get('sungrow_ps_list')?.value;

  if (!accessToken || !psListCookie) return [];

  let psIds: string[];
  try {
    psIds = JSON.parse(psListCookie);
  } catch (err) {
    console.error('Error parsing ps list cookie', err);
    return [];
  }

  if (!psIds.length) return [];

  const requestBody = {
    appkey: SUNGROW_APP_KEY,
    ps_ids: psIds.join(','),
    sns: '',
    lang: '',
    is_get_ps_remarks: '1',
  };

  const requestHeaders = {
    'Content-Type': 'application/json',
    'x-access-key': SUNGROW_SECRET_KEY,
    Authorization: `Bearer ${accessToken}`,
  };

  const url = `${SUNGROW_BASE_URL}${SUNGROW_ENDPOINT_PLANT_INFO}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });
    
    const text = await response.text();
    if (!response.ok) {
      console.error('PlantDetail HTTP error', response.status, text);
      return [];
    }
    
    const data = JSON.parse(text);
    
    // 🔥 token expired → try refresh
    if (data.result_code === 'er_token_login_invalid') {
      console.log('Access token expired. Trying refresh...');
      const refreshed = await refreshSungrowToken();
      if (refreshed) {
        console.log('Retrying plant details after refresh...');
        return await getSungrowPlantDetails();
      }
      return [];
    }
    
    if (data.result_code !== '1') {
      console.error('PlantDetail error:', data.result_msg);
      return [];
    }
    
    const rd = data.result_data;
    if (!rd || rd.code !== '1' || !Array.isArray(rd.data_list)) return [];

    return rd.data_list.map((ps: any) => ({
      psId: ps.ps_id,
      name: ps.ps_name,
      typeName: ps.ps_type_name ?? null,
      location: ps.ps_location ?? null,
      onlineStatus: ps.online_status ?? null,
      buildStatus: ps.build_status ?? null,
      installDate: ps.install_date ?? null,
      timezone: ps.ps_current_time_zone ?? null,
      capacityKw: ps.install_power ?? null,
      faultStatus: ps.ps_fault_status ?? null,
    }));
  } catch (err) {
    console.error('PlantDetail error', err);
    return [];
  }
}

//
// REFRESH TOKEN
//
export async function refreshSungrowToken(): Promise<boolean> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('sungrow_refresh_token')?.value;
  const accessToken = cookieStore.get('sungrow_access_token')?.value;

  if (!refreshToken || !accessToken) {
    console.error('No refresh token found.');
    return false;
  }

  const url = `${SUNGROW_BASE_URL}openapi/apiManage/refreshToken`;

  const requestBody = {
    grant_type: 'refresh_token',
    appkey: SUNGROW_APP_KEY,
    refresh_token: refreshToken,
  };

  const headers = {
    'Content-Type': 'application/json',
    'x-access-key': SUNGROW_SECRET_KEY,
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error('[Refresh] HTTP error:', res.status, text);
      return false;
    }

    const data = JSON.parse(text);

    if (data.result_code !== '1') {
      console.error('[Refresh] API error:', data.result_msg);
      return false;
    }

    const rd = data.result_data;

    const secure = process.env.NODE_ENV === 'production';
    const cookieOptions = { httpOnly: true, secure, path: '/' as const };

    // update tokens
    cookieStore.set('sungrow_access_token', rd.access_token, {
      ...cookieOptions,
      maxAge: Number(rd.expires_in) || 86400,
    });

    cookieStore.set('sungrow_refresh_token', rd.refresh_token, cookieOptions);

    // IMPORTANT: Only overwrite ps_list if Sungrow sends a non-empty list
    if (Array.isArray(rd.auth_ps_list) && rd.auth_ps_list.length > 0) {
      const plantIds = rd.auth_ps_list.map((p: any) => p.ps_id);
      cookieStore.set('sungrow_ps_list', JSON.stringify(plantIds), cookieOptions);
      console.log('[Refresh] Updated plant list from refresh response');
    } else {
      console.log('[Refresh] Keeping existing plant list');
    }

    console.log('🔄 Token refreshed successfully');
    return true;

  } catch (err) {
    console.error('[Refresh] Exception:', err);
    return false;
  }
}
