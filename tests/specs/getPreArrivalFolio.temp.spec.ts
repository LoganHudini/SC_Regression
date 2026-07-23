import { test, expect } from '@playwright/test';
import { GetPreArrivalFolio } from '../utils/getPreArrivalFolio';
import { FetchReservationApi } from '../utils/fetchReservationApi';
import { AuthenticateApi } from '../utils/authenticateApi';
import { loadTestData } from '../utils/testData';

test('fetch pre-arrival folio from API', async ({ request }) => {
  // Load test data for hotel ID and confirmation number
  const testData = loadTestData();
  const hotelId = testData.HOTEL_ID ?? process.env.HOTEL_ID;
  const confirmationNumber = testData.CONFIRMATION_NUMBER ?? process.env.CONFIRMATION_NUMBER;

  if (!hotelId) {
    throw new Error('HOTEL_ID is required. Set it in testData.json or env.');
  }
  if (!confirmationNumber) {
    throw new Error('CONFIRMATION_NUMBER is required. Set it in testData.json or env.');
  }

  // First, fetch reservation details to get the required parameters
  const fetchReservationApi = new FetchReservationApi(request);
  const reservation = await fetchReservationApi.fetchReservationDetails(hotelId, confirmationNumber);

  // Extract lastName from reservation for authentication
  const lastName = reservation.guests?.[0]?.lastName || testData.LAST_NAME || process.env.LAST_NAME;
  
  if (!lastName) {
    throw new Error('lastName not found in reservation response or testData');
  }

  // Authenticate with the lastName from reservation
  const authenticateApi = new AuthenticateApi(request);
  const bearerToken = await authenticateApi.fetchAuthToken({
    hotelId,
    confirmationId: confirmationNumber,
    lastName,
  });

  // Extract reservationId from reservation response
  const reservationId = reservation.reservationId || reservation.details?.id;

  if (!reservationId) {
    throw new Error('reservationId not found in reservation response');
  }

  console.log('Pre-Arrival Folio API Parameters:', {
    hotelId,
    reservationId,
  });

  // Fetch pre-arrival folio
  const getPreArrivalFolio = new GetPreArrivalFolio(request);
  const folio = await getPreArrivalFolio.fetchPreArrivalFolio({
    hotelId,
    reservationId,
    bearerToken,
  });

  expect(folio).toBeTruthy();
  console.log('Fetched pre-arrival folio:', JSON.stringify(folio, null, 2));
});
