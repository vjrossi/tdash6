'use server';

import { SUNGROW_APP_KEY, SUNGROW_SECRET_KEY, SUNGROW_TOKEN_URL, SUNGROW_REDIRECT_URL } from '@/lib/sungrow-config';

export async function getSungrowToken(code: string) {
  // Fail-fast check for server-side environment variables
  if (!SUNGROW_APP_KEY || !SUNGROW_SECRET_KEY) {
    const errorMessage = 'Server configuration error: The Sungrow App Key or Secret is not set on the server. Please ensure environment variables are configured correctly.';
    console.error(`[ERROR] getSungrowToken: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  console.log('--- Initiating Sungrow Token Exchange ---');
  try {
    // The appkey is sent as a header, not in the body, per successful manual testing.
    const requestBody = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SUNGROW_REDIRECT_URL,
    };

    console.log('[REQUEST] Sungrow Token Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(SUNGROW_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-key': SUNGROW_SECRET_KEY, // Secret key
        'x-app-key': SUNGROW_APP_KEY,      // App key
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.text();
    console.log('[RESPONSE] Sungrow Token Response Status:', response.status);
    console.log('[RESPONSE] Sungrow Token Response Body:', responseBody);

    if (!response.ok) {
      const error = new Error(`Sungrow API request failed with status ${response.status}. See server logs for full response body.`);
      (error as any).responseBody = responseBody;
      throw error;
    }

    const data = JSON.parse(responseBody);

    // The successful response does not have a top-level 'result_code'. 
    // It directly contains token data.
    if (response.status === 200 && data.access_token) {
        console.log('--- Sungrow Token Exchange Successful ---');
        // The actual token data is nested inside the 'result_data' object in the successful response.
        return data.result_data;
    } else {
        // Handle cases where the response is OK but doesn't contain the token, or other errors.
        const errorMessage = data.result_msg || 'An unknown error occurred during token exchange.';
        throw new Error(`Sungrow API returned an error: ${errorMessage}`);
    }

  } catch (error) {
    console.error('[ERROR] in getSungrowToken:', error);
    console.log('--- Sungrow Token Exchange Failed ---');
    throw error;
  }
}
