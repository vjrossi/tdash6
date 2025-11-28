export const SUNGROW_APP_KEY = process.env.SUNGROW_APP_KEY || '';
console.log('SUNGROW_APP_KEY:', SUNGROW_APP_KEY);

export const SUNGROW_SECRET_KEY = process.env.SUNGROW_SECRET_KEY || '';
console.log('SUNGROW_SECRET_KEY:', SUNGROW_SECRET_KEY);

// OAuth redirect URL must be NEXT_PUBLIC because the browser needs it
export const SUNGROW_REDIRECT_URL = process.env.NEXT_PUBLIC_SUNGROW_REDIRECT_URL || '';
console.log('NEXT_PUBLIC_SUNGROW_REDIRECT_URL:', SUNGROW_REDIRECT_URL);

export const SUNGROW_RSA_PUBLIC_KEY = process.env.SUNGROW_RSA_PUBLIC_KEY || '';
console.log('SUNGROW_RSA_PUBLIC_KEY:', SUNGROW_RSA_PUBLIC_KEY);

// IMPORTANT: must end with a slash, and must be augateway (NOT CloudFront)
export const SUNGROW_BASE_URL = 'https://augateway.isolarcloud.com/';

// Endpoints: do NOT start with a slash
export const SUNGROW_ENDPOINT_TOKEN = 'openapi/apiManage/token';
export const SUNGROW_ENDPOINT_PLANT_LIST = 'openapi/ps/getPsList';
export const SUNGROW_ENDPOINT_PLANT_INFO = 'openapi/platform/getPowerStationDetail';
export const SUNGROW_ENDPOINT_LIVE_DATA = 'openapi/platform/getPowerStationRealTimeData';