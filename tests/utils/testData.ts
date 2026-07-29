import * as fs from 'fs';
import * as path from 'path';

export interface TestData {
  STAFF_URL?: string;
  EMAIL?: string;
  PASSWORD?: string;
  PROPERTY?: string;
  CONFIRMATION_NUMBER?: string;
  HOTEL_ID?: string;
  APP_CONFIG_API_KEY?: string;
  API_KEY?: string;
  NEXT_PUBLIC_SECRET_KEY?: string;
  SIDECAR_URL?: string;
  SIDECAR_DEVICE?: string;
  RESERVATION_NOTE?: string;
  PHONE_NUMBER?: string;
  ADDL1?: string;
  ADDL2?: string;
  CITY?: string;
  STATE?: string;
  PLACEOFISSUE?: string;
  POSTALCODE?: string;
  USER_ID?: string;
  PROPERTY_DETAILS_API_URL?: string;
  USER_BY_ID_API_URL?: string;
  AGGREGATED_BOOKING_API_URL?: string;
  AUTH_BEARER_TOKEN?: string;
  ARRIVAL_DATE?: string;
  DEPARTURE_DATE?: string;
  FIRST_NAME?: string;
  LAST_NAME?: string;
  SEARCH_TEXT?: string;
  SORT?: string;
}

export function loadTestData(): TestData {
  try {
    const dataPath = path.resolve(__dirname, '../testData.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8')) as TestData;
    }
  } catch (error) {
    console.warn('Unable to load test data from tests/testData.json:', error);
  }

  return {};
}
