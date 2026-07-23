import { test, expect } from '@playwright/test';
import { RoomStatusApi } from '../utils/roomStatusApi';
import { FetchReservationApi } from '../utils/fetchReservationApi';
import { AuthenticateApi } from '../utils/authenticateApi';
import { loadTestData } from '../utils/testData';

test('fetch room status from API', async ({ request }) => {
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

  // Extract required parameters from reservation response
  const checkInDate = reservation.details?.checkInDate?.split('T')[0];
  const checkOutDate = reservation.details?.checkOutDate?.split('T')[0];
  const confirmationId = reservation.confirmationId || reservation.details?.id;

  if (!checkInDate) {
    throw new Error('checkInDate not found in reservation response');
  }
  if (!checkOutDate) {
    throw new Error('checkOutDate not found in reservation response');
  }
  if (!confirmationId) {
    throw new Error('confirmationId not found in reservation response');
  }

  console.log('Room Status API Parameters:', {
    hotelId,
    checkInDate,
    checkOutDate,
    confirmationId,
    lastName,
  });

  // Fetch room status
  const roomStatusApi = new RoomStatusApi(request);
  const roomStatus = await roomStatusApi.fetchRoomStatus({
    hotelId,
    checkInDate,
    checkOutDate,
    confirmationId,
    lastName,
    bearerToken,
  });

  expect(roomStatus).toBeTruthy();
  console.log('Fetched room status:', JSON.stringify(roomStatus, null, 2));
});
