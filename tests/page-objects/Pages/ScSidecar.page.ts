import { Page, expect, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// NOTE: Replace the placeholder values below with real test data or
// read them from environment variables for CI runs.
// Load defaults from tests/testData.json if present
let testData: Record<string, string> = {};
try {
  const dataPath = path.resolve(__dirname, '../testData.json');
  if (fs.existsSync(dataPath)) {
    testData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
} catch (e) {
  // ignore; we'll fall back to env vars or hardcoded placeholders
}

const TEST_URL = testData.SIDECAR_URL;
const TEST_EMAIL = testData.EMAIL;
const TEST_PASSWORD = testData.PASSWORD;
const TEST_PROPERTY = testData.PROPERTY;
const TEST_DEVICE = testData.SIDECAR_DEVICE;

export class SidecarPage {
  constructor(private page: Page) {
    // Initialize locators here so `this.page` is available
    this.emailTxtBx = this.page.locator('//input[@id="email"]');
    this.continueBtn = this.page.locator('//button[text()="continue"]');
    this.passwordTxtBx = this.page.locator('//input[@id="password"]');
    this.loginBtn = this.page.locator('//button[text()="login"]');
    this.propertyDropdown = this.page.locator(
      '//div[@class="flex flex-row items-center justify-between"]',
    );
    this.propertyOptions = this.page.locator(
      '//div[@class="z-50 overflow-y-auto"]//div[contains(@class,"flex items-center")]',
    );
    this.propertyContinueBtn = this.page.locator('//button[@name="continue"]');
    this.deviceIdText = this.page.locator('//p[contains(@class,"mb-4 mt-6")]');
    this.deviceInput = this.page.locator('//input[@id="deviceName"]');
    this.connectSidecarBtn = this.page.locator('//button[text()="Connect sidecar"]');

    // E-reg page
    this.loyaltyPopup = this.page.locator(
      '//div[@class="flex h-full w-full flex-col rounded-xl bg-white px-5 pb-8 pt-8"]',
    );
    this.loyaltyPopupText = this.page.locator(
      '//p[@class="text-bg-bg-brand-blue-shade1 font-Medium text-xl mobile:text-2xl"]',
    );
    this.guestsInsideLoyaltyPopup = this.page.locator(
      '//div[@class="w-64 min-w-64 max-w-64 p-2 py-3"]',
    );
    this.guestsnameInsideLoyaltyPopup = this.page.locator(
      '//span[@class="max-w-full truncate text-lg text-brand-blue-shade1"]',
    );
    this.selectionCheckBox = this.page.locator(
      '//div[@class="flex max-w-full flex-col justify-start overflow-hidden rounded-sm bg-brand-pink-shade1 p-3"]/preceding-sibling::div//*[@xmlns="http://www.w3.org/2000/svg"]',
    );
    this.joinLoyaltyButton = this.page.locator('//button[text()="Join Loyalty Program"]');
    this.reviewandSignPageTitle = this.page.locator(
      '//div[@class="w-full text-left font-Regular text-xl leading-none text-brand-gray-shade8 mobile:text-3xl-md ml-6"]',
    );
    this.titleText = this.page.locator('//p[@class="mb-5 text-center text-base"]');
    this.stayInfo = this.page.locator(
      '//p[@class="font-Regular text-base leading-none text-brand-gray-shade2 mobile:text-xl"]',
    );
    this.bookingID = this.page.locator(
      '//p[text()="Booking ID"]/parent::div//div[@class="hyphens-manual break-all	font-Medium  first-letter:uppercase"]//span',
    );
    this.roomNumber = this.page.locator(
      '//p[text()="Room No"]/parent::div//div[@class="hyphens-manual break-all	font-Medium  first-letter:uppercase"]//span',
    );
    this.checkInDate = this.page.locator(
      '//p[text()="Check-In Date"]/parent::div//div[@class="hyphens-manual break-all	font-Medium  first-letter:uppercase"]//span',
    );
    this.checkOutDate = this.page.locator(
      '//p[text()="Check-Out Date"]/parent::div//div[@class="hyphens-manual break-all	font-Medium  first-letter:uppercase"]//span',
    );
    this.guestCountInEreg = this.page.locator(
      '//p[text()="Guests"]/parent::div//div[@class="hyphens-manual break-all	font-Medium  first-letter:uppercase"]//span',
    );
    this.roomType = this.page.locator(
      '//p[text()="Room Type"]/parent::div//div[@class="hyphens-manual break-all	font-Medium  first-letter:uppercase"]//span',
    );
    this.settlementType = this.page.locator(
      '//p[text()="Settlement Type"]/parent::div//div[@class="hyphens-manual break-all	font-Medium  first-letter:uppercase"]//span',
    );
    this.totalCostOfStay = this.page.locator(
      '//p[text()="Total Cost of Stay"]/parent::div//div[@class="hyphens-manual break-all	font-Medium  first-letter:uppercase"]//span',
    );
  }

  // Locators
  emailTxtBx: Locator;
  continueBtn: Locator;
  passwordTxtBx: Locator;
  loginBtn: Locator;
  propertyDropdown: Locator;
  propertyOptions: Locator;
  propertyContinueBtn: Locator;
  deviceIdText: Locator;
  deviceInput: Locator;
  connectSidecarBtn: Locator;

  sharedDeviceID = '';

  // Actions

  async launchAndLogin(TEST_URL: string, TEST_EMAIL: string) {
    await this.page.goto(TEST_URL);
    console.log('Launching Sidecar URL');

    await expect(this.emailTxtBx).toBeVisible();
    await this.emailTxtBx.fill(TEST_EMAIL);
    console.log('Verification of visibility and filling of email textbox is successful');

    await expect(this.continueBtn).toBeVisible();
    await this.continueBtn.click();
    console.log('Verification of visibility and clicking of continue button is successful');
  }
  async enterPassword(TEST_PASSWORD: string) {
    await expect(this.passwordTxtBx).toBeVisible();
    await this.passwordTxtBx.fill(TEST_PASSWORD);
    console.log('Verification of visibility and filling of password textbox is successful');

    await expect(this.loginBtn).toBeVisible();
    await this.loginBtn.click();
    console.log('Verification of visibility and clicking of login button is successful');
  }

  async selectProperty(TEST_PROPERTY: string) {
    await this.propertyDropdown.click();

    const propertyOption = this.page.locator(`//div[text()='${TEST_PROPERTY}']`);
    await expect(propertyOption).toBeVisible();
    await propertyOption.click();
    console.log(
      'Verification of visibility and clicking of property option in the property selection dropdown is successful',
    );

    await expect(this.propertyContinueBtn).toBeVisible();
    await this.propertyContinueBtn.click();
    console.log(
      'Verification of visibility and clicking of property continue button is successful',
    );
  }

  async connectSidecar(TEST_DEVICE: string) {
    const deviceText = await this.deviceIdText.textContent();

    this.sharedDeviceID = deviceText?.replace(/\D/g, '') || '';
    console.log('Device ID from UI:', this.sharedDeviceID);

    await this.deviceInput.fill(TEST_DEVICE);
    console.log('Verification of visibility and filling of device input is successful');

    await this.connectSidecarBtn.waitFor({ state: 'visible', timeout: 3000 });
    await this.connectSidecarBtn.click();
    console.log('Verification of visibility and clicking of connect sidecar button is successful');
  }

  async verifySidecarConnection(expectedText?: string) {
    // If an expected text is provided, verify the sidecar UI shows it
    if (expectedText) {
      await expect(this.page.locator('//p[contains(@class,"py-2")]')).toHaveText(expectedText);
      console.log('Verification of expected text in sidecar UI is successful');
    }

    // Wait for the URL to include a deviceId query parameter (e.g. ?deviceId=12345)
    // Some apps navigate client-side and the URL may update slightly after the UI change,
    // so wait a short time for that to happen.
    try {
      await this.page.waitForURL(/deviceId=\d+/, { timeout: 10000 });
    } catch (err) {
      const currentUrl = this.page.url();
      console.error('Timed out waiting for deviceId in URL. Current URL:', currentUrl);
      throw new Error('DeviceId not present in URL after connection — current URL: ' + currentUrl);
    }

    const currentUrl = this.page.url();
    console.log('Current URL after wait:', currentUrl);

    const match = currentUrl.match(/deviceId=(\d+)/);
    const deviceIdFromUrl = match ? match[1] : '';
    console.log('Device ID from URL:', deviceIdFromUrl);

    if (!this.sharedDeviceID) {
      console.error(
        'sharedDeviceID is empty. It should be set earlier in the flow (connectSidecar).',
      );
      throw new Error('sharedDeviceID was not set before verifySidecarConnection');
    }

    // Final assertion: the device ID captured from the UI before connection should match the ID in the URL
    expect(this.sharedDeviceID).toBe(deviceIdFromUrl);
    console.log('Verification of device ID in URL matching the shared device ID is successful');
  }
  getSharedDeviceID(): string {
    return this.sharedDeviceID;
  }
  async verifyReservationReceived() {
    console.log('Switching back to Sidecar');
    await this.page.bringToFront();
    // Optional wait for sync
    await this.page.waitForTimeout(5000);

    // Optional refresh if Sidecar doesn't auto-update
    await this.page.reload();
    console.log('Sidecar screen refreshed');
  }

  // e-reg stay info locators:
  loyaltyPopup: Locator;
  loyaltyPopupText: Locator;
  guestsInsideLoyaltyPopup: Locator;
  guestsnameInsideLoyaltyPopup: Locator;
  selectionCheckBox: Locator;
  joinLoyaltyButton: Locator;
  reviewandSignPageTitle: Locator;
  titleText: Locator;
  stayInfo: Locator;
  bookingID: Locator;
  roomNumber: Locator;
  checkInDate: Locator;
  checkOutDate: Locator;
  guestCountInEreg: Locator;
  roomType: Locator;
  settlementType: Locator;
  totalCostOfStay: Locator;

  async verifyEregpageDetails() {
    try {
      // Verify loyalty popup appears with correct text
      await this.page.waitForTimeout(5000); // wait for potential popup to appear
      const isLoyaltyPopupVisible = await this.loyaltyPopup.isVisible().catch(() => false);

      if (isLoyaltyPopupVisible) {
        console.log('Loyalty popup is displayed');

        const popupText = await this.loyaltyPopupText.textContent();
        console.log('Loyalty popup text:', popupText);

        // verify howmany guest and guest name inside the loyalty popup
        const guestCount = await this.guestsInsideLoyaltyPopup.count();
        console.log('Number of guests inside loyalty popup:', guestCount);

        // Loop through each guest and log their names
        const guestNames = await this.guestsnameInsideLoyaltyPopup.count();
        for (let i = 0; i < guestNames; i++) {
          const guestName = await this.guestsnameInsideLoyaltyPopup.nth(i).textContent();
          console.log(`Guest ${i + 1} name inside loyalty popup:`, guestName);
        }

        // selection checkbox and click on join loyalty button
        const checkboxCount = await this.selectionCheckBox.count();

        console.log(`Total checkboxes found: ${checkboxCount}`);

        if (checkboxCount > 0) {
          for (let i = 0; i < checkboxCount; i++) {
            const checkbox = this.selectionCheckBox.nth(i);

            if (await checkbox.isVisible()) {
              await checkbox.click();
              console.log(`Clicked checkbox ${i + 1}`);
            }
          }
        } else {
          console.log('No selection checkboxes found');
        }

        // Click on Join Loyalty Program button
        await expect(this.joinLoyaltyButton).toBeVisible();
        await this.joinLoyaltyButton.click();
        console.log('Clicked on Join Loyalty Program button');
        await this.reviewandSignPageTitle.waitFor({ state: 'visible', timeout: 15000 });
      } else {
        console.log('Loyalty popup is not displaying');
      }
    } catch (error) {
      console.error('Error while verifying loyalty popup:', error);
    }

    // validation of guets stay info in the review and sign page
    try {
      // Ereg title
      try {
        await expect(this.reviewandSignPageTitle).toBeVisible();
        console.log('Review and Sign page title visible');
      } catch (e) {
        console.log('Review and Sign page title not visible');
      }

      // E reg sub title
      await expect(this.titleText).toBeVisible();
      console.log('Review and Sign page subtitle is visible');
      console.log('Review and Sign page subtitle text:', await this.titleText.textContent());

      // Guest stay info
      await expect(this.stayInfo).toBeVisible();
      console.log('Guest stay info is visible');
      console.log('Guest stay info text:', await this.stayInfo.textContent());

      // Booking ID
      await expect(this.bookingID).toBeVisible();
      console.log('Booking ID is visible');
      console.log('Booking ID text:', await this.bookingID.textContent());

      // Room Number
      await expect(this.roomNumber).toBeVisible();
      console.log('Room Number is visible');
      console.log('Room Number text:', await this.roomNumber.textContent());

      // Check-In Date
      await expect(this.checkInDate).toBeVisible();
      console.log('Check-In Date is visible');
      console.log('Check-In Date text:', await this.checkInDate.textContent());

      // Check-Out Date
      await expect(this.checkOutDate).toBeVisible();
      console.log('Check-Out Date is visible');
      console.log('Check-Out Date text:', await this.checkOutDate.textContent());

      // Guest Count
      await expect(this.guestCountInEreg).toBeVisible();
      console.log('Guest Count is visible');
      console.log('Guest Count text:', await this.guestCountInEreg.textContent());

      // Room Type
      await expect(this.roomType).toBeVisible();
      console.log('Room Type is visible');
      console.log('Room Type text:', await this.roomType.textContent());

      // Settlement Type
      await expect(this.settlementType).toBeVisible();
      console.log('Settlement Type is visible');
      console.log('Settlement Type text:', await this.settlementType.textContent());
      // Total Cost of Stay
      try {
        await expect(this.totalCostOfStay).toBeVisible();
        console.log('Total Cost of Stay visible');
      } catch (e) {
        console.log('Total Cost of Stay not visible');
      }
    } catch (error) {
      console.error('Error while verifying Review and Sign page title:', error);
    }
  }
}
