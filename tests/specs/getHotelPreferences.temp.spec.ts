import { test, expect } from '@playwright/test';
import { GetHotelPreferences } from '../utils/getHotelPreferences';
import { AuthenticateApi } from '../utils/authenticateApi';
import { loadTestData } from '../utils/testData';

test('fetch hotel preferences from API', async ({ request }) => {
  // Load test data for hotel ID
  const testData = loadTestData();
  const hotelId = testData.HOTEL_ID ?? process.env.HOTEL_ID;

  if (!hotelId) {
    throw new Error('HOTEL_ID is required. Set it in testData.json or env.');
  }

  // Authenticate to get bearer token
  const authenticateApi = new AuthenticateApi(request);
  const bearerToken = await authenticateApi.fetchAuthToken();

  console.log('Hotel Preferences API Parameters:', {
    hotelId,
  });

  // Fetch hotel preferences
  const getHotelPreferences = new GetHotelPreferences(request);
  const preferences = await getHotelPreferences.fetchHotelPreferences({
    hotelId,
    bearerToken,
  });

  expect(preferences).toBeTruthy();
  console.log('Fetched hotel preferences:', JSON.stringify(preferences, null, 2));
});
