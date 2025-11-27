'use server';

import { SUNGROW_APP_KEY, SUNGROW_SECRET_KEY, SUNGROW_REDIRECT_URL } from '@/lib/sungrow-config';

export async function getSungrowToken(code: string) {
  try {
    const response = await fetch('https://auweb3.isolarcloud.com/openapi/apiManage/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-key': SUNGROW_SECRET_KEY!,
      },
      body: JSON.stringify({
        appkey: SUNGROW_APP_KEY,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SUNGROW_REDIRECT_URL,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Sungrow token:', error);
    return { error: 'Failed to fetch token' };
  }
}
