import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/testData';
import { GetGuestActivityBookings } from '../utils/getGuestActivityBookings';

test('fetch guest activity bookings and save API response', async ({ request }) => {
  const testData = loadTestData();

  const hotelId = testData.HOTEL_ID ?? process.env.HOTEL_ID;
  const bearerToken = testData.AUTH_BEARER_TOKEN ?? process.env.AUTH_BEARER_TOKEN;
  const arrivalDate =
    testData.ARRIVAL_DATE ??
    process.env.ARRIVAL_DATE ??
    new Date().toISOString().split('T')[0];

  if (!hotelId) {
    throw new Error('HOTEL_ID is required. Set it in tests/testData.json or environment variables.');
  }
  if (!bearerToken) {
    throw new Error('AUTH_BEARER_TOKEN is required. Set it in tests/testData.json or environment variables.');
  }

  const getGuestActivityBookings = new GetGuestActivityBookings(request);

  const response = await getGuestActivityBookings.fetchGuestActivityBookings({
    hotelId,
    bearerToken,
    arrivalDate,
    limit: 0,
    confirmationId: '',
    departureDate: '',
    firstName: '',
    lastName: '',
    searchText: '',
    sort: '',
  });

  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  expect(Array.isArray(response.data.getGuestActivityBookings.guests)).toBe(true);

  console.log('Guest activity bookings response saved to api-responses/guestActivityBookings.json');
});
