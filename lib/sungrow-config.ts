export const SUNGROW_APP_KEY = process.env.SUNGROW_APP_KEY || '';
console.log('SUNGROW_APP_KEY:', SUNGROW_APP_KEY);

export const SUNGROW_SECRET_KEY = process.env.SUNGROW_SECRET_KEY || '';
console.log('SUNGROW_SECRET_KEY:', SUNGROW_SECRET_KEY);

export const SUNGROW_REDIRECT_URL = process.env.NEXT_PUBLIC_SUNGROW_REDIRECT_URL || '';
console.log('NEXT_PUBLIC_SUNGROW_REDIRECT_URL:', SUNGROW_REDIRECT_URL);

export const SUNGROW_RSA_PUBLIC_KEY = process.env.SUNGROW_RSA_PUBLIC_KEY || '';
console.log('SUNGROW_RSA_PUBLIC_KEY:', SUNGROW_RSA_PUBLIC_KEY);

export const SUNGROW_TOKEN_URL = 'https://augateway.isolarcloud.com/openapi/apiManage/token';
