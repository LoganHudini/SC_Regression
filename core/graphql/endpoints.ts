import {
  getFetchFromDb,
  getHotelId,
  getMessageBirdWidgetId,
  getSaveToDb,
} from 'utils/fetchConfigs';

export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

export const PROPERTY_A = process.env.NEXT_PUBLIC_PROPERTY_A;
export const API_KEY_PROPERTY_A = process.env.NEXT_PUBLIC_API_KEY_PROPERTY_A;

export const PROPERTY_B = process.env.NEXT_PUBLIC_PROPERTY_B;
export const API_KEY_PROPERTY_B = process.env.NEXT_PUBLIC_API_KEY_PROPERTY_B;

export const PROPERTY_C = process.env.NEXT_PUBLIC_PROPERTY_C;
export const API_KEY_PROPERTY_C = process.env.NEXT_PUBLIC_API_KEY_PROPERTY_C;

export const PROPERTY_D = process.env.NEXT_PUBLIC_PROPERTY_D;
export const API_KEY_PROPERTY_D = process.env.NEXT_PUBLIC_API_KEY_PROPERTY_D;

export const PROPERTY_E = process.env.NEXT_PUBLIC_PROPERTY_E;
export const API_KEY_PROPERTY_E = process.env.NEXT_PUBLIC_API_KEY_PROPERTY_E;

export const PROPERTY_F = process.env.NEXT_PUBLIC_PROPERTY_F;
export const API_KEY_PROPERTY_F = process.env.NEXT_PUBLIC_API_KEY_PROPERTY_F;

export const PROPERTY_G = process.env.NEXT_PUBLIC_PROPERTY_G;
export const API_KEY_PROPERTY_G = process.env.NEXT_PUBLIC_API_KEY_PROPERTY_G;

export const INTEGRATION_A = process.env.NEXT_PUBLIC_INTEGRATION_A;
export const INTEGRATION_API_KEY_PROPERTY_A = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_A;

export const INTEGRATION_B = process.env.NEXT_PUBLIC_INTEGRATION_B;
export const INTEGRATION_API_KEY_PROPERTY_B = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_B;

export const INTEGRATION_C = process.env.NEXT_PUBLIC_INTEGRATION_C;
export const INTEGRATION_API_KEY_PROPERTY_C = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_C;

export const INTEGRATION_D = process.env.NEXT_PUBLIC_INTEGRATION_D;
export const INTEGRATION_API_KEY_PROPERTY_D = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_D;

export const INTEGRATION_F = process.env.NEXT_PUBLIC_INTEGRATION_F;
export const INTEGRATION_API_KEY_F = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_F;

export const INTEGRATION_G = process.env.NEXT_PUBLIC_INTEGRATION_G;
export const INTEGRATION_API_KEY_G = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_G;

export const INTEGRATION_H = process.env.NEXT_PUBLIC_INTEGRATION_H;
export const INTEGRATION_API_KEY_H = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_H;

export const INTEGRATION_K = process.env.NEXT_PUBLIC_INTEGRATION_K;
export const INTEGRATION_API_KEY_K = process.env.NEXT_PUBLIC_API_KEY_INTEGRATION_K;

export const REST_API_URL = process.env.NEXT_PUBLIC_REST_API_URL;
export const X_API_TOKEN = process.env.NEXT_PUBLIC_X_API_TOKEN;
export const X_API_GROUP = process.env.NEXT_PUBLIC_X_API_GROUP;

export const X_API_TOKEN_D = process.env.NEXT_PUBLIC_X_API_TOKEN_D;
export const X_API_GROUP_D = process.env.NEXT_PUBLIC_X_API_GROUP_D;

export const REST_E_API_URL = process.env.NEXT_PUBLIC_REST_E_API_URL;

export const ASSETS_URL = process.env.NEXT_PUBLIC_ASSETS_URL;
export const ONPREM_API_URL = process.env.NEXT_PUBLIC_ONPREM_API_URL;
export const S3_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL;
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
export const HUDINI_CHAT_URL = process.env.NEXT_PUBLIC_HUDINI_CHAT_URL;

// property specific settings
export const BRAND_CODE = process.env.NEXT_PUBLIC_BRAND_CODE;
export const HOTEL_ID = getHotelId();
export const FETCH_FROM_DB = getFetchFromDb();
export const SAVE_TO_DB = getSaveToDb();
export const THEME_COLOR = '#ffffff';
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const MESSAGE_BIRD_WIDGET_ID = getMessageBirdWidgetId();
