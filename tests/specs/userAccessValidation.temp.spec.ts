import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { StaffConnectPage } from '../page-objects/Pages/StaffConnect.page';
import { UserAccessValidation, ValidateUserAccess } from '../utils/userAccessValidation';

interface TestDataConfig {
  STAFF_URL?: string;
  EMAIL?: string;
  PASSWORD?: string;
  PROPERTY?: string;
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

test('temp - validate user property and module access', async ({ page, request }) => {
  const staffConnectPage = new StaffConnectPage(page, request);
  const accessApi = new UserAccessValidation(request);
  const validator = new ValidateUserAccess(request, page);

  await test.step('Launch StaffConnect and login', async () => {
    await staffConnectPage.launchAndLogin(testData.STAFF_URL || '', testData.EMAIL || '');
    await staffConnectPage.enterPassword(testData.PASSWORD || '');
  });

  await test.step('Select the configured property', async () => {
    await staffConnectPage.selectProperty(testData.PROPERTY || '');
  });

  await test.step('Call property details API', async () => {
    const propertyNames = await accessApi.fetchPropertyDetails();
    console.log('Property details API names:', propertyNames);
  });

  await test.step('Call user by ID API and validate UI access', async () => {
    const userId = testData.USER_ID || testData.EMAIL || '';
    await validator.validatePropertyAndModuleAccess(userId);
  });

  await test.step('Verify successful login state', async () => {
    await staffConnectPage.verifySuccessfulLogin();
  });
});
