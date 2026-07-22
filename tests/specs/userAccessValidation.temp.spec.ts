import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ValidateUserAccess } from '../utils/userAccessValidation';

interface TestDataConfig {
  USER_ID?: string;
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

test('temp - validate user property and module access', async ({ request }) => {
  const validator = new ValidateUserAccess(request);

  await test.step('Call APIs and save responses', async () => {
    const userId = testData.USER_ID || '';
    await validator.validatePropertyAndModuleAccess(userId);
  });
});
