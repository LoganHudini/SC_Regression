import { test, expect } from '@playwright/test';
import { FetchReservationApi } from '../utils/fetchReservationApi';
import { loadTestData } from '../utils/testData';

test('fetch reservation details from API', async ({ request }) => {
  const testData = loadTestData();
  
  const fetchReservationApi = new FetchReservationApi(request);
  
  const hotelId = testData.HOTEL_ID ?? process.env.HOTEL_ID;
  const confirmationNumber = testData.CONFIRMATION_NUMBER ?? process.env.CONFIRMATION_NUMBER;

  if (!hotelId) {
    throw new Error('HOTEL_ID is required. Set it in testData.json or env.');
  }
  if (!confirmationNumber) {
    throw new Error('CONFIRMATION_NUMBER is required. Set it in testData.json or env.');
  }

  const reservation = await fetchReservationApi.fetchReservationDetails(hotelId, confirmationNumber);

  expect(reservation).toBeTruthy();
  console.log('Fetched reservation details:', JSON.stringify(reservation, null, 2));
});
