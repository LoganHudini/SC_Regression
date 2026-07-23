import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ValidateAggregatedFutureBooking } from '../utils/aggregatedFutureBookingValidation';

interface TestDataConfig {
  AGGREGATED_BOOKING_API_URL?: string;
  AUTH_BEARER_TOKEN?: string;
  HOTEL_ID?: string;
}

function loadTestData(): TestDataConfig {
  try {
    const dataPath = path.resolve(__dirname, '../testData.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8')) as TestDataConfig;
    }
  } catch (error) {
    console.warn('Unable to load test data from tests/testData.json:', error);
  }

  return {};
}

const testData = loadTestData();

test('temp - validate aggregated future booking', async ({ request }) => {
  const validator = new ValidateAggregatedFutureBooking(request);

  await test.step('Call aggregated future booking API and save response', async () => {
    const hotelId = testData.HOTEL_ID || '';
    await validator.fetchAndSaveBookingResponse(hotelId);
  });
});
