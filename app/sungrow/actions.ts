
'use server';

import { SUNGROW_APP_KEY, SUNGROW_SECRET_KEY, SUNGROW_TOKEN_URL, SUNGROW_REDIRECT_URL } from '@/lib/sungrow-config';

export async function getSungrowToken(code: string) {
  if (!SUNGROW_APP_KEY || !SUNGROW_SECRET_KEY) {
    const errorMessage = 'Server configuration error: The Sungrow App Key or Secret is not set on the server. Please ensure environment variables are configured correctly.';
    console.error(`[ERROR] getSungrowToken: ${errorMessage}`);
    throw new Error(errorMessage);
  }

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
        // Add a standard browser User-Agent to bypass CloudFront restrictions
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
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

    if (data.result_code !== '1') {
      throw new Error(`Sungrow API returned an error: ${data.result_msg}`);
    }

    console.log('--- Sungrow Token Exchange Successful ---');
    return data.result_data;

  } catch (error) {
    console.error('[ERROR] in getSungrowToken:', error);
    console.log('--- Sungrow Token Exchange Failed ---');
    throw error;
  }
}
