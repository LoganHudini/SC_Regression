import { BrowserContext, Page, test } from '@playwright/test';
import { SidecarPage } from '../page-objects/Pages/ScSidecar.page';
import { StaffConnectPage } from '../page-objects/Pages/StaffConnect.page';

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
const CONFIRMATION_NUMBER = testData.CONFIRMATION_NUMBER;
const RESERVATION_NOTE = testData.RESERVATION_NOTE;

// Common Credentials
const TEST_EMAIL = testData.EMAIL;
const TEST_PASSWORD = testData.PASSWORD;
const TEST_PROPERTY = testData.PROPERTY;

test.describe('Sidecar + StaffConnect Flow', () => {
  // -----------------------------
  // Sidecar Session
  // -----------------------------
  let sidecarContext: BrowserContext;
  let sidecarPageObj: Page;
  let sidecar: SidecarPage;

  // -----------------------------
  // StaffConnect Session
  // -----------------------------
  let staffContext: BrowserContext;
  let staffPageObj: Page;
  let staffConnect: StaffConnectPage;

  test.beforeAll(async ({ browser }) => {
    // =========================================
    // Browser Session 1 -> Sidecar
    // =========================================
    sidecarContext = await browser.newContext();
    sidecarPageObj = await sidecarContext.newPage();

    sidecar = new SidecarPage(sidecarPageObj);
  });

  // test.afterAll(async () => {

  //   // Close both browsers after execution
  //   await sidecarContext.close();
  //   await staffContext.close();

  // });

  // =========================================================
  // SIDE CAR FLOW
  // =========================================================

  test('Complete Sidecar creation flow', async () => {
    test.setTimeout(120000);

    // Launch Sidecar
    await test.step('Verify that the user is navigated to the Sidecar login page on launching the URL, and the Email ID field is present and allows input, with the Continue button visible and clickable', async () => {
      await sidecar.launchAndLogin(SIDECAR_URL, TEST_EMAIL);
    });

    // Login
    await test.step('Verify that the user can enter their password and click the login button', async () => {
      await sidecar.enterPassword(TEST_PASSWORD);
    });

    // Select Property
    await test.step('Verify that the user can select a property from the dropdown', async () => {
      await sidecar.selectProperty(TEST_PROPERTY);
    });
    // Verify Login
    await test.step('Verify that the user is successfully logged in and navigated to the Sidecar main page', async () => {
      // Connect Device
      await sidecar.connectSidecar(SIDECAR_DEVICE);

      // Verify Connection
      await sidecar.verifySidecarConnection();
      const deviceID = sidecar.getSharedDeviceID();
    });
  });

  // =========================================================
  // STAFF CONNECT FLOW
  // =========================================================

  test('Complete StaffConnect flow', async ({ browser }) => {
    test.setTimeout(120000);
    // =========================================
    // Browser Session 2 -> StaffConnect
    // =========================================
    staffContext = await browser.newContext();
    staffPageObj = await staffContext.newPage();

    staffConnect = new StaffConnectPage(staffPageObj);

    // Example methods
    // Create these methods inside StaffConnect.page.ts
    await test.step('Verify that the user is navigated to the StaffConnect login page on launching the URL, and the Email ID field is present and allows input, with the Continue button visible and clickable', async () => {
      await staffConnect.launchAndLogin(STAFF_URL, TEST_EMAIL);
    });
    await test.step('Verify that the user can enter their password and click the login button', async () => {
      await staffConnect.enterPassword(TEST_PASSWORD);
    });
    await test.step('Verify that the user can select a property from the dropdown', async () => {
      await staffConnect.selectProperty(TEST_PROPERTY);
    });
    await test.step('Verify that the user is successfully logged in and navigated to the StaffConnect main page', async () => {
      await staffConnect.verifySuccessfulLogin();
    });
    await test.step('Verify that the sidecar connection created in the previous session is visible in StaffConnect', async () => {
      // Pass the device ID from Sidecar to StaffConnect for verification
      const deviceIDFromSidecar = sidecar.getSharedDeviceID();
      await staffConnect.verifyCreatedSidearConnection(deviceIDFromSidecar);
    });
    await test.step('Verify that the arrival section headers details are visible in the guests module in StaffConnect', async () => {
      await staffConnect.verifyArrivalSection();
    });
    await test.step('Verify that the user can search for a guest using the confirmation number in the guests module in StaffConnect', async () => {
      await staffConnect.verifyArrivalGuests(CONFIRMATION_NUMBER);
    });
    await test.step('Verify that the user can view the resrvation details and arrival information in StaffConnect', async () => {
      await staffConnect.verifyDetailsinReservationSection();
    });
    await test.step('Verify that the user able add the reservation note and able to click on AddNote button in StaffConnect', async () => {
      await staffConnect.verifyAddingNotesinReservationSection(RESERVATION_NOTE);
    });
    await test.step('verify that the user can navigate to the Guest Tab and verify the details in Guest Tab in StaffConnect', async () => {
      await staffConnect.verifyDetailsinGuestTab();
    });
    await test.step('Verify that the user can open the Ereg flow and able to select the sidecar device and connect in StaffConnect', async () => {
      await staffConnect.verifyEregFlow(SIDECAR_DEVICE);
    });
    await test.step('Verify that the reservation is received in Sidecar', async () => {
      await sidecarPageObj.bringToFront();
      await sidecar.verifyReservationReceived();
    });

    await test.step('Verify that the user can view the details in Ereg page in Sidecar', async () => {
      await sidecar.verifyEregpageDetails();
    });
  });
});
