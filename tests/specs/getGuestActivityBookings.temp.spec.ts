import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/testData';
import { GetGuestActivityBookings } from '../utils/getGuestActivityBookings';

test('fetch guest activity bookings and save API response', async ({ request }) => {
  const testData = loadTestData();

  const hotelId = testData.HOTEL_ID ?? process.env.HOTEL_ID;
  const apiKey = testData.API_KEY ?? process.env.API_KEY;
  const arrivalDate = testData.ARRIVAL_DATE ?? process.env.ARRIVAL_DATE ?? new Date().toISOString().split('T')[0];

  if (!hotelId) {
    throw new Error('HOTEL_ID is required. Set it in tests/testData.json or environment variables.');
  }
  if (!apiKey) {
    throw new Error('API_KEY is required. Set it in tests/testData.json or environment variables.');
  }

  const getGuestActivityBookings = new GetGuestActivityBookings(request);

  const response = await getGuestActivityBookings.fetchGuestActivityBookings({
    hotelId,
    apiKey,
    arrivalDate,
    limit: 0,
    confirmationId: '',
    departureDate: '',
    firstName: '',
    lastName: '',
    searchText: '',
    sort: '',
  });

  console.log('API Response:', JSON.stringify(response, null, 2));

  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  
  const guests = response.data.getGuestActivityBookings.guests;
  if (guests === null) {
    console.log('No guests found for the given arrival date. This is valid if there are no bookings for today.');
  } else {
    expect(Array.isArray(guests)).toBe(true);
  }

  console.log('Guest activity bookings response saved to tests/api-responses/guestActivityBookings.json');
});
