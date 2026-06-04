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
    this.propertyDropdown = this.page.locator('//div[@class="flex flex-row items-center justify-between"]');
    this.propertyOptions = this.page.locator('//div[@class="z-50 overflow-y-auto"]//div[contains(@class,"flex items-center")]');
    this.propertyContinueBtn = this.page.locator('//button[@name="continue"]');
    this.deviceIdText = this.page.locator('//p[contains(@class,"mb-4 mt-6")]');
    this.deviceInput = this.page.locator('//input[@id="deviceName"]');
    this.connectSidecarBtn = this.page.locator('//button[text()="Connect sidecar"]');
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
    console.log('Verification of visibility and clicking of property option in the property selection dropdown is successful');

    await expect(this.propertyContinueBtn).toBeVisible();
    await this.propertyContinueBtn.click();
    console.log('Verification of visibility and clicking of property continue button is successful');
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
      console.error('sharedDeviceID is empty. It should be set earlier in the flow (connectSidecar).');
      throw new Error('sharedDeviceID was not set before verifySidecarConnection');
    }

    // Final assertion: the device ID captured from the UI before connection should match the ID in the URL
    expect(this.sharedDeviceID).toBe(deviceIdFromUrl);
    console.log('Verification of device ID in URL matching the shared device ID is successful');
  }
  getSharedDeviceID(): string {
   return this.sharedDeviceID;
}
}