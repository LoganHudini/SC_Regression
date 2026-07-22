import { test, expect } from '@playwright/test';
import { PersonalisationsApi } from '../utils/personalisationsApi';
import { AuthenticateApi } from '../utils/authenticateApi';
import { loadTestData } from '../utils/testData';

test('fetch personalisations from API', async ({ request }) => {
  const testData = loadTestData();
  
  const authenticateApi = new AuthenticateApi(request);
  const bearerToken = await authenticateApi.fetchAuthToken();

  const personalisationsApi = new PersonalisationsApi(request);
  
  const hotelId = testData.HOTEL_ID ?? process.env.HOTEL_ID;
  const confirmationId = testData.CONFIRMATION_NUMBER ?? process.env.CONFIRMATION_NUMBER;
  const startDate = new Date().toISOString().split('T')[0];

  if (!hotelId) {
    throw new Error('HOTEL_ID is required. Set it in testData.json or env.');
  }
  if (!confirmationId) {
    throw new Error('CONFIRMATION_NUMBER is required. Set it in testData.json or env.');
  }

  const personalisations = await personalisationsApi.fetchPersonalisations(
    hotelId,
    startDate,
    confirmationId,
    bearerToken,
  );

  expect(personalisations).toBeTruthy();
  console.log('Fetched personalisations:', JSON.stringify(personalisations, null, 2));
});
