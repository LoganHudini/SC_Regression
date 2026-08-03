import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/Pages/Login.page';

import * as fs from 'fs';
import * as path from 'path';

// Load test data
let testData: Record<string, string> = {};

try {
  const dataPath = path.resolve(__dirname, '../testData.json');

  if (fs.existsSync(dataPath)) {
    testData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
} catch (e) {
  console.log('Unable to load test data');
}

// Sidecar Data
const SIDECAR_URL = testData.SIDECAR_URL;
const SIDECAR_DEVICE = testData.SIDECAR_DEVICE;

// StaffConnect Data
const STAFF_URL = testData.STAFF_URL;

// Common Credentials
const TEST_EMAIL = testData.EMAIL;
const TEST_PASSWORD = testData.PASSWORD;
const TEST_PROPERTY = testData.PROPERTY;

// Front Desk Staff Credentials for Test Case 2
const FRONT_DESK_STAFF_EMAIL = testData.frontDeskStaff_Email;
const FRONT_DESK_STAFF_PASSWORD = testData.frontDeskStaff_Password;

// Staff Role Credentials for Test Case 2
const STAFF_ROLE_EMAIL = testData.staffrole_Email;
const STAFF_ROLE_PASSWORD = testData.staffrole_Password;

// Admin Role Credentials for Test Case 1
const ADMIN_ROLE_EMAIL = testData.adminRole_Email;
const ADMIN_ROLE_PASSWORD = testData.adminRole_Password;

test.describe('Role-Based Login Tests', () => {
  test('Scenario_001: Verify that the user with Front Desk Admin role can create Sidecar and delete Sidecars', async ({ browser }) => {
    try {
      test.setTimeout(120000);

      // Step 1: Launch Sidecar and create device
      const sidecarContext = await browser.newContext();
      const sidecarPageObj = await sidecarContext.newPage();
      const sidecarLoginPage = new LoginPage(sidecarPageObj);

      await sidecarLoginPage.completeSidecarLogin(SIDECAR_URL, ADMIN_ROLE_EMAIL, ADMIN_ROLE_PASSWORD, TEST_PROPERTY);
      const deviceId = await sidecarLoginPage.verifyDeviceCreation(SIDECAR_DEVICE);
      console.log('Created Sidecar Device ID:', deviceId);

      // Step 2: Launch Staff Connect browser and login with admin role credentials
      const staffContext = await browser.newContext();
      const staffPageObj = await staffContext.newPage();
      const staffLoginPage = new LoginPage(staffPageObj);

      await staffLoginPage.completeStaffConnectLogin(STAFF_URL, ADMIN_ROLE_EMAIL, ADMIN_ROLE_PASSWORD, TEST_PROPERTY);

      // Step 3: Navigate to Devices section
      await staffLoginPage.navigateToDeviceModule();

      // Step 4: Verify the created Sidecar with device name is displayed
      await staffLoginPage.verifyDeviceSearch(deviceId);

      // Step 5: Click on delete icon at the device corner and delete the device
      await staffLoginPage.verifyDeviceDeletion(deviceId);

      // Step 6: Verify the deleted device is NOT displayed
      await staffLoginPage.verifyDeviceNotDisplayed(deviceId);

      // Cleanup
      await sidecarContext.close();
      await staffContext.close();
    } catch (error) {
      const err: any = error;
      console.error(`Test failed: ${test.info().title}\n${err && err.stack ? err.stack : err}`);
      throw error;
    }
  });

  test('Scenario_002: Verify that the user with front desk staff can access the guests section', async ({ browser }) => {
    try {
      test.setTimeout(120000);

      // Launch Staff Connect browser and login with front desk staff credentials
      const staffContext = await browser.newContext();
      const staffPageObj = await staffContext.newPage();
      const staffLoginPage = new LoginPage(staffPageObj);

      await staffLoginPage.completeStaffConnectLogin(STAFF_URL, STAFF_ROLE_EMAIL, STAFF_ROLE_PASSWORD, TEST_PROPERTY);

      // Verify guests section is displayed and clickable
      await staffLoginPage.verifyGuestsSectionAccessible();

      // Cleanup
      await staffContext.close();
    } catch (error) {
      const err: any = error;
      console.error(`Test failed: ${test.info().title}\n${err && err.stack ? err.stack : err}`);
      throw error;
    }
  });
});
