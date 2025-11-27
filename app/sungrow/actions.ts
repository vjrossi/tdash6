'use server';

import { SUNGROW_APP_KEY, SUNGROW_SECRET_KEY, SUNGROW_TOKEN_URL, SUNGROW_REDIRECT_URL } from '@/lib/sungrow-config';

// export async function getSungrowToken(code: string) {
//   if (!SUNGROW_APP_KEY || !SUNGROW_SECRET_KEY) {
//     const errorMessage = 'Server configuration error: The Sungrow App Key or Secret is not set on the server. Please ensure environment variables are configured correctly.';
//     console.error(`[ERROR] getSungrowToken: ${errorMessage}`);
//     throw new Error(errorMessage);
//   }

//   console.log('--- Initiating Sungrow Token Exchange ---');
//   try {
//     const requestBody = {
//       grant_type: 'authorization_code',
//       appkey: SUNGROW_APP_KEY,
//       code: code,
//       redirect_uri: SUNGROW_REDIRECT_URL,
//     };

//     const requestHeaders = {
//         'Content-Type': 'application/json',
//         'x-access-key': SUNGROW_SECRET_KEY,
//       }

//     console.log('[REQUEST] Sungrow Token Request Body:', JSON.stringify(requestBody, null, 2));
//     console.log('[REQUEST] Sungrow Token Request Headers:', JSON.stringify(requestHeaders, null, 2));

//     const response = await fetch(SUNGROW_TOKEN_URL, {
//       method: 'POST',
//       headers: requestHeaders,
//       body: JSON.stringify(requestBody),
//     });

//     const responseBody = await response.text();
//     console.log('[RESPONSE] Sungrow Token Response Status:', response.status);
//     console.log('[RESPONSE] Sungrow Token Response Body:', responseBody);

//     if (!response.ok) {
//       const error = new Error(`Sungrow API request failed with status ${response.status}. See server logs for full response body.`);
//       (error as any).responseBody = responseBody;
//       throw error;
//     }

//     const data = JSON.parse(responseBody);

//     if (data.result_code !== '1') {
//       throw new Error(`Sungrow API returned an error: ${data.result_msg}`);
//     }

//     console.log('--- Sungrow Token Exchange Successful ---');
//     return data.result_data;

//   } catch (error) {
//     console.error('[ERROR] in getSungrowToken:', error);
//     console.log('--- Sungrow Token Exchange Failed ---');
//     throw error;
//   }
// }

export async function getSungrowToken(code: string) {
  if (!SUNGROW_APP_KEY || !SUNGROW_SECRET_KEY || !SUNGROW_REDIRECT_URL || !SUNGROW_TOKEN_URL) {
    const errorMessage =
      'Server configuration error: Sungrow env vars missing (APP_KEY / SECRET / REDIRECT / TOKEN_URL).';
    console.error('[SUNGROW] ' + errorMessage, {
      hasAppKey: !!SUNGROW_APP_KEY,
      hasSecret: !!SUNGROW_SECRET_KEY,
      hasRedirect: !!SUNGROW_REDIRECT_URL,
      hasTokenUrl: !!SUNGROW_TOKEN_URL,
    });
    throw new Error(errorMessage);
  }

  const requestBody = {
    grant_type: 'authorization_code',
    appkey: SUNGROW_APP_KEY,
    code, // <- dynamic!
    redirect_uri: SUNGROW_REDIRECT_URL,
  };

  const requestHeaders = {
    'Content-Type': 'application/json',
    'x-access-key': SUNGROW_SECRET_KEY,
    Accept: '*/*',
  };

  console.log('[SUNGROW] URL:', SUNGROW_TOKEN_URL);
  console.log('[SUNGROW] BODY:', JSON.stringify(requestBody, null, 2));
  console.log('[SUNGROW] HEADERS (masked):', {
    ...requestHeaders,
    'x-access-key': '***' + SUNGROW_SECRET_KEY.slice(-4),
  });

  try {
    const response = await fetch(SUNGROW_TOKEN_URL, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('[SUNGROW] STATUS:', response.status);
    console.log('[SUNGROW] RAW RESPONSE:', responseText);

    if (!response.ok) {
      const err: any = new Error(`Sungrow API failed with HTTP ${response.status}`);
      err.responseBody = responseText;
      throw err;
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[SUNGROW] JSON parse error:', e);
      throw new Error('Failed to parse Sungrow response as JSON');
    }

    if (data.result_code !== '1') {
      throw new Error(`Sungrow API error: ${data.result_msg || data.result_code}`);
    }

    return data.result_data;
  } catch (error) {
    console.error('[SUNGROW] getSungrowToken error:', error);
    throw error;
  }
}
