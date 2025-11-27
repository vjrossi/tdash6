'use server';

import { SUNGROW_APP_KEY, SUNGROW_SECRET_KEY, SUNGROW_TOKEN_URL, SUNGROW_REDIRECT_URL } from '@/lib/sungrow-config';

export async function getSungrowToken(code: string) {
  console.log('--- Initiating Sungrow Token Exchange ---');
  try {
    const requestBody = {
      grant_type: 'authorization_code',
      appkey: SUNGROW_APP_KEY,
      code: code,
      redirect_uri: SUNGROW_REDIRECT_URL,
    };

    console.log('[REQUEST] Sungrow Token Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(SUNGROW_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-key': SUNGROW_SECRET_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.text();
    console.log('[RESPONSE] Sungrow Token Response Status:', response.status);
    console.log('[RESPONSE] Sungrow Token Response Body:', responseBody);

    if (!response.ok) {
      const error = new Error(`Sungrow API request failed with status ${response.status}. See server logs for full response body.`);
      // Attach the response body for richer client-side error display
      (error as any).responseBody = responseBody;
      throw error;
    }

    const data = JSON.parse(responseBody);

    if (data.result_code !== '1') {
      throw new Error(`Sungrow API returned an error: ${data.result_msg}`);
    }

    console.log('--- Sungrow Token Exchange Successful ---');
    return data.result_data;
  } catch (error) {
    console.error('[ERROR] in getSungrowToken:', error);
    console.log('--- Sungrow Token Exchange Failed ---');
    // Re-throw the error to be caught by the client
    throw error;
  }
}
