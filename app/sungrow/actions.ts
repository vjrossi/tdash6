'use server';

import { SUNGROW_APP_KEY, SUNGROW_SECRET_KEY, SUNGROW_REDIRECT_URL, SUNGROW_TOKEN_URL } from '@/lib/sungrow-config';

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
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SUNGROW_REDIRECT_URL,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.result_code !== '1') {
      const errorMessage = data.result_msg || 'An unknown API error occurred.';
      console.error('Sungrow API Error:', errorMessage, data);
      return { success: false, error: errorMessage };
    }

    // TODO: Store the token securely
    // For now, just returning it to the client for verification
    return { success: true, data: data.result_data };

  } catch (error) {
    console.error('Error fetching Sungrow token:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to fetch token. Reason: ${errorMessage}` };
  }
}
