'use server';

import { SUNGROW_APP_KEY, SUNGROW_SECRET_KEY, SUNGROW_TOKEN_URL, SUNGROW_REDIRECT_URL } from '@/lib/sungrow-config';

export async function getSungrowToken(code: string) {
  try {
    const response = await fetch(SUNGROW_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-key': SUNGROW_SECRET_KEY,
      },
      body: JSON.stringify({
        appkey: SUNGROW_APP_KEY,
        code: code,
        redirect_uri: SUNGROW_REDIRECT_URL,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sungrow token exchange failed:', errorText);
      throw new Error(`Failed to fetch token. Reason: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Sungrow token data:', data);

    // Check for API-level errors
    if (data.result_code !== '1') {
      console.error('Sungrow API Error:', data.result_msg);
      throw new Error(`Sungrow API Error: ${data.result_msg}`);
    }

    return data.result_data;
  } catch (error) {
    console.error('Error in getSungrowToken:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch token. Reason: ${errorMessage}`);
  }
}
