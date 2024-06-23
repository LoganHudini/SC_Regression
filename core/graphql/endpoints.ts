import {
  getFetchFromDb,
  getHotelId,
  getMessageBirdWidgetId,
  getSaveToDb,
} from 'utils/fetchConfigs';

export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

export const HOST_V0 = process.env.NEXT_PUBLIC_HOST_V0;
export const API_KEY_V0 = process.env.NEXT_PUBLIC_API_KEY_V0;

export const HOST_V1 = process.env.NEXT_PUBLIC_HOST_V1;
export const API_KEY_V1 = process.env.NEXT_PUBLIC_API_KEY_V1;

export const HOST_V2 = process.env.NEXT_PUBLIC_HOST_V2;
export const API_KEY_V2 = process.env.NEXT_PUBLIC_API_KEY_V2;

export const HOST_V3 = process.env.NEXT_PUBLIC_HOST_V3;
export const API_KEY_V3 = process.env.NEXT_PUBLIC_API_KEY_V3;

export const HOST_V4 = process.env.NEXT_PUBLIC_HOST_V4;
export const API_KEY_V4 = process.env.NEXT_PUBLIC_API_KEY_V4;

export const HOST_V5 = process.env.NEXT_PUBLIC_HOST_V5;
export const API_KEY_V5 = process.env.NEXT_PUBLIC_API_KEY_V5;

export const INTEGRATION_HOST_V5 = process.env.NEXT_PUBLIC_HOST_INTEGRATION_V5;
export const INTEGRATION_API_KEY_V5 = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_V5;

export const INTEGRATION_HOST_V6 = process.env.NEXT_PUBLIC_HOST_INTEGRATION_V6;
export const INTEGRATION_API_KEY_V6 = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_V6;

export const HOST_V6 = process.env.NEXT_PUBLIC_HOST_V6;
export const API_KEY_V6 = process.env.NEXT_PUBLIC_API_KEY_V6;

export const HOST_MESSAGES = process.env.NEXT_PUBLIC_HOST_MESSAGES;
export const API_KEY_MESSAGES = process.env.NEXT_PUBLIC_API_KEY_MESSAGES;

export const HOST_HOUSEKEEPING_ORDER = process.env.NEXT_PUBLIC_HOST_HOUSEKEEPING_ORDER;
export const API_KEY_HOUSEKEEPING_ORDER = process.env.NEXT_PUBLIC_API_KEY_HOUSEKEEPING_ORDER;

export const INTEGRATION_HOST_V1 = process.env.NEXT_PUBLIC_HOST_INTEGRATION_V1;
export const INTEGRATION_API_KEY_V1 = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_V1;

export const REST_API_URL = process.env.NEXT_PUBLIC_REST_API_URL;
export const REST_V4_API_URL = process.env.NEXT_PUBLIC_REST_V4_API_URL;

export const X_API_TOKEN = process.env.NEXT_PUBLIC_X_API_TOKEN;
export const X_API_GROUP = process.env.NEXT_PUBLIC_X_API_GROUP;

export const X_API_TOKEN_V3 = process.env.NEXT_PUBLIC_X_API_TOKEN_V3;
export const X_API_GROUP_V3 = process.env.NEXT_PUBLIC_X_API_GROUP_V3;

export const ASSETS_URL = process.env.NEXT_PUBLIC_ASSETS_URL;
export const ONPREM_API_URL = process.env.NEXT_PUBLIC_ONPREM_API_URL;

export const S3_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL;

// property specific settings
export const BRAND_CODE = process.env.NEXT_PUBLIC_BRAND_CODE;
export const HOTEL_ID = getHotelId();
export const FETCH_FROM_DB = getFetchFromDb();
export const SAVE_TO_DB = getSaveToDb();
export const THEME_COLOR = '#ffffff';
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const MESSAGE_BIRD_WIDGET_ID = getMessageBirdWidgetId();
