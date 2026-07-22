import { Page, expect, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { CanvasUtils } from '../../utils/CanvasUtils';

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
const TEST_PHONE = testData.PHONE_NUMBER;
const AD_L1 = testData.ADDL1;
const AD_L2 = testData.ADDL2;
const CITY = testData.CITY;
const STATE = testData.STATE;
const PLACEOFISSUE = testData.PLACEOFISSUE;
const POSTALCODE = testData.POSTALCODE;

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

    // primary guests details in the review and sign page
    this.expandIcon = this.page.locator('//div[@class="relative cursor-pointer rotate-0"]');
    this.guestHeader = this.page.locator(
      '//p[@class="text-brand-gray-shade2 font-Regular text-base leading-none  mobile:text-xl"]',
    );
    this.guestFirstName = this.page.locator('//p[text()="First Name"]/parent::div//div//span');
    this.guestlastName = this.page.locator('//p[text()="Last Name"]/parent::div//div//span');
    this.phoneNumberCountryCode = this.page.locator(
      '//p[text()="Phone Number"]/parent::div/following-sibling::div//span',
    );
    this.countryCodeDropdownIcon = this.page.locator('//*[@class="ml-1 h-4 w-4"]');
    this.countrySearchInput = this.page.locator(
      '//div[@class="absolute left-0 z-20 mt-1 max-h-60 w-full min-w-[250px] max-w-[100vw] overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"]//input[@type="text"]',
    );
    this.countryOptionIND = this.page.locator(
      '//div[@class="absolute left-0 z-20 mt-1 max-h-60 w-full min-w-[250px] max-w-[100vw] overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"]//span[text()="India"]',
    );
    this.phoneNumber = this.page.locator(
      '//p[text()="Phone Number"]/parent::div/following-sibling::div//div/following::div//input[@type="tel"]',
    );
    this.emailinEreg = this.page.locator(
      '//p[text()="Email"]/parent::div/following-sibling::div//input[@name="email"]',
    );
    this.genderValueinEreg = this.page.locator(
      '//p[text()="Gender"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
    );
    this.documentTypeinEreg = this.page.locator(
      '//p[text()="Document Type"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
    );
    this.documentNumberinEreg = this.page.locator(
      '//p[text()="Document Number"]/parent::div/following-sibling::div//input[@name="docNo"]',
    );
    this.documentIssueDateinEreg = this.page.locator(
      '//p[text()="Document Issue Date"]/parent::div/following-sibling::div//div//span//input[@id="issueDate"]',
    );
    this.documentExpiryDateinEreg = this.page.locator(
      '//p[text()="Document Expiry Date"]/parent::div/following-sibling::div//div//span//input[@id="expiry"]',
    );
    this.dobinEreg = this.page.locator(
      '//p[text()="Date of Birth"]/parent::div/following-sibling::div//div//span//input[@id="dob"]',
    );
    this.addressLine1 = this.page.locator(
      '//p[text()="Address Line 1"]/parent::div/following-sibling::div//input[@id="addressLine"]',
    );
    this.addressLine2 = this.page.locator(
      '//p[text()="Address Line 2"]/parent::div/following-sibling::div//input[@id="addressLine2"]',
    );
    this.city = this.page.locator(
      '//p[text()="City"]/parent::div/following-sibling::div//input[@id="cityName"]',
    );
    this.state = this.page.locator(
      '//p[text()="State"]/parent::div/following-sibling::div//input[@id="stateProv"]',
    );
    this.placeOfIssue = this.page.locator(
      '//p[text()="Place of Issue"]/parent::div/following-sibling::div//input[@name="placeOfIssue"]',
    );
    this.countryOfResidence = this.page.locator(
      '//p[text()="Country Of Residence"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
    );
    this.postalCode = this.page.locator(
      '//p[text()="Postal Code"]/parent::div/following-sibling::div//input[@id="postalCode"]',
    );
    this.nationality = this.page.locator(
      '//p[text()="Nationality"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
    );
    this.countryOfIssue = this.page.locator(
      '//p[text()="Country of Issue"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
    );
    this.birthCountry = this.page.locator(
      '//p[text()="Birth Country"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
    );
    this.birthPlace = this.page.locator(
      '//p[text()="Birth Place"]/parent::div/following-sibling::div//input[@name="birthPlace"]',
    );
    this.membershipNumber = this.page.locator(
      '//p[text()="Membership Number"]/parent::div/following-sibling::div//input[@name="membershipNumber"]',
    );
    this.membershipType = this.page.locator(
      '//p[text()="Membership Type"]/parent::div/following-sibling::div//input[@name="membershipType"]',
    );
    this.signatureSection = this.page.locator(
      '//p[text()="Guest Signature"]/parent::div/parent::div/following-sibling::div//canvas[@class="border-brand-gray-shade3 border-1 bg-[#F4F6FD] h-full w-full rounded-lg"]',
    );
    this.termsandconditions = this.page.locator('//p[@class="pr-1 text-wrap font-Regular"]');
    this.termsandconditionCheckBox = this.page.locator(
      '//p[@class="pr-1 text-wrap font-Regular"]/parent::div/preceding-sibling::div//*[@xmlns="http://www.w3.org/2000/svg"]',
    );
    this.submitButton = this.page.locator('//button[text()="Submit for approval"]');
    this.waitPopup = this.page.locator(
      '//div[@class="relative z-20 flex h-full transform-gpu flex-row items-center justify-center duration-300 ease-in-out will-change-transform w-full translate-y-0 scale-100 opacity-100"]',
    );
    this.popupText = this.page.locator(
      '//p[@class="flex text-center font-Medium text-2xl leading-relaxed text-brand-blue-shade1 desktop:text-xl"]',
    );
    this.thankyouPage = this.page.locator('//p[@class="mt-6 font-Medium text-xl"]');
    this.postApprovalPopupText = this.page.locator(
      '//span[text()="Information has been verified. "]',
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
      await this.loyaltyPopup.waitFor({ state: 'visible', timeout: 30000 });
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
        console.log('Total Cost of Stay text:', await this.totalCostOfStay.textContent());
      } catch (e) {
        console.log('Total Cost of Stay not visible');
      }
    } catch (error) {
      console.error('Error while verifying Review and Sign page title:', error);
    }
  }
  expandIcon: Locator;
  guestHeader: Locator;
  guestFirstName: Locator;
  guestlastName: Locator;
  phoneNumberCountryCode: Locator;
  countryCodeDropdownIcon: Locator;
  countrySearchInput: Locator;
  countryOptionIND: Locator;
  phoneNumber: Locator;
  emailinEreg: Locator;
  genderValueinEreg: Locator;
  documentTypeinEreg: Locator;
  documentNumberinEreg: Locator;
  documentIssueDateinEreg: Locator;
  documentExpiryDateinEreg: Locator;
  dobinEreg: Locator;
  addressLine1: Locator;
  addressLine2: Locator;
  city: Locator;
  state: Locator;
  placeOfIssue: Locator;
  countryOfResidence: Locator;
  postalCode: Locator;
  nationality: Locator;
  countryOfIssue: Locator;
  birthCountry: Locator;
  birthPlace: Locator;
  membershipType: Locator;
  membershipNumber: Locator;

  async verifyGuestDetailsInReviewAndSignPage(
    TEST_PHONE: string,
    EMAIL: string,
    AD_L1: string,
    AD_L2: string,
    CITY: string,
    STATE: string,
  ) {
    // Click to expand guest details section
    try {
      let visibleExpandCount = await this.expandIcon.count();
      console.log(`Total expand icons found: ${visibleExpandCount}`);

      while ((await this.expandIcon.count()) > 0) {
        const expand = this.expandIcon.first();

        try {
          await expand.scrollIntoViewIfNeeded();
          await expand.click();
          console.log('Clicked one expand icon');

          // Small wait for accordion animation/UI refresh
          await this.page.waitForTimeout(500);
        } catch (error) {
          console.log('Failed to click expand icon');
          break;
        }

        // Safety check to avoid infinite loop
        const currentCount = await this.expandIcon.count();
        if (currentCount === visibleExpandCount) {
          console.log('Expand icon count not changing, stopping loop');
          break;
        }

        visibleExpandCount = currentCount;
      }
    } catch (error) {
      console.error('Error while clicking expand icons:', error);
    }

    // Verify guest header
    try {
      await expect(this.guestHeader.first()).toBeVisible();

      const guestCount = await this.guestHeader.count();
      console.log('Number of guest headers found:', guestCount);

      for (let i = 0; i < guestCount; i++) {
        const guestType = (await this.guestHeader.nth(i).textContent())?.trim() || '';
        const firstName = (await this.guestFirstName.nth(i).textContent())?.trim() || '';
        const lastName = (await this.guestlastName.nth(i).textContent())?.trim() || '';
        // country code
        let country = '';
        try {
          const countryCode =
            (await this.phoneNumberCountryCode.nth(i).textContent())?.trim() || '';
          if (countryCode !== '') {
            country = countryCode;
            console.log(`Country Code for Guest ${i + 1}: ${countryCode}`);
          } else {
            console.log(`Country Code is empty for Guest ${i + 1}, selecting India`);

            await this.countryCodeDropdownIcon.nth(i).click();
            await this.countrySearchInput.fill('India');
            await this.countryOptionIND.click();
            console.log(`Selected India country code for Guest ${i + 1}`);
          }
        } catch (e) {
          console.log(`Error occurred while fetching country code for Guest ${i + 1}`);
          console.log(e);

          country = 'Not Available';
        }
        // Phone Number
        let phone = '';

        try {
          const phonenumber = (await this.phoneNumber.nth(i).textContent())?.trim() || '';

          if (phonenumber) {
            phone = phonenumber;
            console.log(`Phone Number for Guest ${i + 1}: ${phonenumber}`);
          } else {
            console.log(`Phone Number not available for Guest ${i + 1}, adding number`);
            await this.phoneNumber.nth(i).fill(TEST_PHONE);
            phone = TEST_PHONE;
            console.log(`Added Phone Number for Guest ${i + 1}: ${phone}`);
          }
        } catch (e) {
          console.log(`Error occurred while fetching phone number for Guest ${i + 1}`);
          console.log(e);
        }
        //  Email
        let email = '';
        try {
          email = (await this.emailinEreg.nth(i).inputValue())?.trim() || '';
          if (email !== '') {
            console.log(`Guest email ${i + 1}: ${email}`);
          } else {
            console.log(`Email is not available for Guest ${i + 1}`);
            await this.emailinEreg.nth(i).fill(EMAIL);
            email = EMAIL;
            console.log(`Added addressline1 for Guest ${i + 1}: ${email}`);
          }
        } catch (e) {
          console.log(`Error occured while fetching email ${i + 1} `);
        }
        // gender value
        let genderValue = '';
        try {
          genderValue = (await this.genderValueinEreg.nth(i).inputValue())?.trim() || '';
          if (genderValue !== '') {
            console.log(`Guest gender ${i + 1}: ${genderValue}`);
          } else {
            console.log(` Gender is not available for guest ${i + 1}`);
          }
        } catch (e) {
          console.log(`Error occurred while fetching gender for Guest ${i + 1}`);
          console.log(e);
        }
        // Document type
        let documentType = '';
        try {
          documentType = (await this.documentTypeinEreg.nth(i).inputValue())?.trim() || '';
          if (documentType !== '') {
            console.log(`Guest Document type ${i + 1}: ${documentType}`);
          } else {
            console.log(`Document Type is not available for guest ${i + 1}`);
          }
        } catch (e) {
          console.log(`Error occurred while fetching document type for Guest ${i + 1}`);
          console.log(e);
        }
        // Document Number
        let documentNumber = '';
        try {
          documentNumber = (await this.documentNumberinEreg.nth(i).inputValue())?.trim() || '';
          if (documentNumber !== '') {
            console.log(`Guest Document Number ${i + 1}: ${documentNumber}`);
          } else {
            console.log(`Document Number is not available for Guest ${i + 1}`);
          }
        } catch (e) {
          console.log(`Error occured while fetching document number ${i + 1} `);
        }
        // Document Issue date
        let documentIssueDate = '';

        try {
          documentIssueDate =
            (await this.documentIssueDateinEreg.nth(i).inputValue())?.trim() || '';

          if (documentIssueDate !== '') {
            console.log(`Guest document issue date ${i + 1}: ${documentIssueDate}`);
          } else {
            console.log(`Document issue date not available for guest ${i + 1}`);
          }
        } catch (e) {
          console.log(`Error occured while fetching document issue date ${i + 1}`);
        }
        // Document expiry date
        let documentExpiryDate = '';
        try {
          documentExpiryDate =
            (await this.documentIssueDateinEreg.nth(i).inputValue())?.trim() || '';
          if (documentExpiryDate !== '') {
            console.log(`Guest document expiry date ${i + 1}: ${documentExpiryDate}`);
          } else {
            console.log(`Document expiry date not available for guest ${i + 1}`);
          }
        } catch (e) {
          console.log(`Error occured while fetching document expiry date ${i + 1}`);
        }
        // DOB
        let dob = '';
        try {
          dob = (await this.dobinEreg.nth(i).inputValue())?.trim() || '';
          if (dob !== '') {
            console.log(`DOB of guest ${i + 1}: ${dob}`);
          } else {
            console.log(`DOB is not available for guest ${i + 1}`);
          }
        } catch (e) {
          console.log(`Error Occured while fetching dob ${i + 1}`);
        }
        // AddressLine1
        let addL1 = '';
        try {
          addL1 = (await this.addressLine1.nth(i).textContent())?.trim() || '';
          if (addL1 !== '') {
            console.log(`Addressline1 for guest ${i + 1}: ${addL1}`);
          } else {
            console.log(`Address line1 not available for Guest ${i + 1}, adding addressline1`);
            await this.addressLine1.nth(i).fill(AD_L1);
            addL1 = AD_L1;
            console.log(`Added addressline1 for Guest ${i + 1}: ${addL1}`);
          }
        } catch {
          console.log(`Error occured while fetching addl1 ${i + 1}`);
        }
        // AddressLine2
        let addL2 = '';
        try {
          addL2 = (await this.addressLine2.nth(i).textContent())?.trim() || '';
          if (addL2 !== '') {
            console.log(`Addressline2 for guest ${i + 1}: ${addL2}`);
          } else {
            console.log(`Address line2 not available for Guest ${i + 1}, adding addressline2`);
            await this.addressLine2.nth(i).fill(AD_L2);
            addL2 = AD_L2;
            console.log(`Added addressline2 for Guest ${i + 1}: ${addL2}`);
          }
        } catch {
          console.log(`Error occured while fetching addl2 ${i + 1}`);
        }
        // City
        let city = '';
        try {
          city = (await this.city.nth(i).textContent())?.trim() || '';
          if (city !== '') {
            console.log(`city for guest ${i + 1}: ${city}`);
          } else {
            console.log(`City not available for Guest ${i + 1}, adding city`);
            await this.city.nth(i).fill(CITY);
            city = CITY;
            console.log(`Added city for Guest ${i + 1}: ${city}`);
          }
        } catch {
          console.log(`Error occured while fetching city ${i + 1}`);
        }
        // State
        let state = '';
        try {
          state = (await this.state.nth(i).textContent())?.trim() || '';
          if (state !== '') {
            console.log(`state for guest ${i + 1}: ${state}`);
          } else {
            console.log(`State not available for Guest ${i + 1}, adding state`);
            await this.city.nth(i).fill(STATE);
            state = STATE;
            console.log(`Added state for Guest ${i + 1}: ${state}`);
          }
        } catch {
          console.log(`Error occured while fetching state ${i + 1}`);
        }

        console.log(`\n========== Guest ${i + 1} ==========`);

        // Differentiate Primary vs Accompanying
        console.log(`Guest Type : ${guestType}`);
        console.log(`First Name : ${firstName}`);
        console.log(`Last Name  : ${lastName}`);
        console.log(`Phone Number Countrycode : ${country}`);
        console.log(`Phoe Number : ${phone}`);
        console.log(`Email: ${email}`);
        console.log(`Gender: ${genderValue}`);
        console.log(`Document Type: ${documentType}`);
        console.log(`Document Number: ${documentNumber}`);
        console.log(`Document Issue Date: ${documentIssueDate}`);
        console.log(`Document Expiry Date: ${documentExpiryDate}`);
        console.log(`DOB: ${dob}`);
        console.log(`AddressLine1: ${addL1}`);
        console.log(`AddressLine2: ${addL2}`);
        console.log(`City: ${city}`);
        console.log(`State: ${state}`);
      }
    } catch (e) {
      console.log('Guest details not visible');
      console.log(e);
    }
  }
  signatureSection: Locator;
  async addGuestSignatures() {
    try {
      const signatureCount = await this.signatureSection.count();
      console.log(`Total Signature Canvases Found: ${signatureCount}`);

      for (let i = 0; i < signatureCount; i++) {
        const canvas = this.signatureSection.nth(i);

        await CanvasUtils.drawSignature(this.page, canvas);

        const hasSignature = await CanvasUtils.hasSignature(canvas);
        if (hasSignature) {
          console.log(`Signature added to canvas ${i + 1}`);
        } else {
          console.log(`Signature was not detected on canvas ${i + 1}`);
        }
      }
    } catch (error) {
      console.log('Error while adding signatures');
      console.log(error);
    }
  }
  termsandconditions: Locator;
  termsandconditionCheckBox: Locator;

  async termsandcontionValidation() {
    try {
      const termsCount = await this.termsandconditions.count();
      console.log(`Total Terms & Conditions found: ${termsCount}`);

      for (let i = 0; i < termsCount; i++) {
        const checkbox = this.termsandconditionCheckBox.nth(i);

        const isSelected =
          (await checkbox.locator('xpath=.//*[contains(@data-name,"153474")]').count()) > 0;
        if (isSelected) {
          console.log(`Terms & Conditions checkbox already selected for Guest ${i + 1}`);
        } else {
          console.log(`Terms & Conditions checkbox not selected for Guest ${i + 1}`);
          await checkbox.click();

          console.log(`Terms & Conditions checkbox selected for Guest ${i + 1}`);
        }
        const termsText = (await this.termsandconditions.nth(i).textContent())?.trim() || '';
        console.log(`Terms & Conditions Text for Guest ${i + 1}: ${termsText}`);
      }
    } catch (e) {
      console.log('Error while validating Terms & Conditions');
      console.log(e);
    }
  }
  submitButton: Locator;
  waitPopup: Locator;
  popupText: Locator;

  async submitforApprovalvalidation() {
    try {
      // Verify Submit button is visible
      await expect(this.submitButton).toBeVisible();
      console.log('Submit for Approval button is visible');

      // Verify Submit button is enabled
      await expect(this.submitButton).toBeEnabled();
      console.log('Submit for Approval button is enabled');

      // Click Submit button
      await this.submitButton.click();
      console.log('Clicked Submit for Approval button');

      // Verify wait popup appears
      await expect(this.waitPopup).toBeVisible({ timeout: 10000 });
      console.log('Wait popup is displayed');

      // Print popup text
      const popupMessage = (await this.popupText.textContent())?.trim() || '';
      console.log(`Popup Text: ${popupMessage}`);
    } catch (e) {
      console.log('Error while validating Submit for Approval flow');
      console.log(e);
    }
  }
  thankyouPage: Locator;
  postApprovalPopupText: Locator;
  async validationAfterAproval() {
    try {
      await this.page.bringToFront();

      // Wait for post approval popup text
      await expect(this.postApprovalPopupText).toBeVisible({ timeout: 30000 });

      const popupMessage = (await this.postApprovalPopupText.textContent())?.trim() || '';
      console.log(`Post Approval Popup Text: ${popupMessage}`);

      // await expect(this.postApprovalPopupText).toBeHidden({ timeout: 30000 });
      // console.log('Post approval popup disappeared');

      // // Verify Thank You page
      // await expect(this.thankyouPage).toBeVisible({ timeout: 30000 });

      // const thankYouText =
      //   (await this.thankyouPage.textContent())?.trim() || '';

      // console.log(`Thank You Page Text: ${thankYouText}`);
    } catch (e) {
      console.log('Error while validating post approval flow');
      console.log(e);
    }
  }
}
