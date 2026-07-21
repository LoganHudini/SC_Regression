import { test, expect } from '@playwright/test';
import { FetchAppConfiguration } from '../utils/fetchAppConfigApi';

test('fetch app configuration from API', async ({ request }) => {
  const fetcher = new FetchAppConfiguration(request);

  const config = await fetcher.fetchAndSaveConfiguration();

  expect(config).toBeTruthy();
  console.log('Fetched app configuration keys:', Object.keys(config));
});
