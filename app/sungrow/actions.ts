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
        grant_type: 'authorization_code',
        appkey: SUNGROW_APP_KEY,
        code: code,
        redirect_uri: SUNGROW_REDIRECT_URL,
      }),
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Sungrow token exchange failed with status:', response.status, 'Body:', errorBody);
      // Create a more informative error to display to the user
      const detailedError = `Sungrow token exchange failed: ${errorBody}`;
      throw new Error(detailedError);
    }

    const data = await response.json();
    console.log('Sungrow token data:', data);

    // Check for API-level errors in the response body
    if (data.result_code !== '1') {
      console.error('Sungrow API Error:', data.result_msg);
      throw new Error(`Sungrow API Error: ${data.result_msg}`);
    }

    return data.result_data;
  } catch (error) {
    console.error('Error in getSungrowToken:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Pass the raw HTML error to the client if that's what we received
    if (errorMessage.includes('<HTML>')) {
        throw new Error(errorMessage);
    }
    throw new Error(`An unexpected error occurred.${errorMessage}`);
  }
}
