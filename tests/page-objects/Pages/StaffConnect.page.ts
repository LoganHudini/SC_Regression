import { Page, expect, Locator, APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { FetchReservationApi } from '../../utils/fetchReservationApi';

interface TestDataConfig {
  STAFF_URL?: string;
  EMAIL?: string;
  PASSWORD?: string;
  PROPERTY?: string;
  CONFIRMATION_NUMBER?: string;
}

function loadTestData(): TestDataConfig {
  try {
    const dataPath = path.resolve(__dirname, '../../testData.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8')) as TestDataConfig;
    }
  } catch (error) {
    console.warn('Unable to load test data from tests/testData.json:', error);
  }

  return {};
}

const testData = loadTestData();

const TEST_URL = testData.STAFF_URL;
const TEST_EMAIL = testData.EMAIL;
const TEST_PASSWORD = testData.PASSWORD;
const TEST_PROPERTY = testData.PROPERTY;
const CONFIRMATION_NUMBER = testData.CONFIRMATION_NUMBER;

export class StaffConnectPage {
  private fetchReservationApi: FetchReservationApi;
  constructor(private page: Page, private request: APIRequestContext) {
    this.fetchReservationApi = new FetchReservationApi(request);
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
    this.hudiniScLogo = this.page.locator(
      '//div[@class="flex h-full flex-col justify-between overflow-y-auto"]//div[@class="absolute left-0 p-10 opacity-100"]//*[@xmlns="http://www.w3.org/2000/svg"]',
    );
    this.deviceModule = this.page.locator(
      '(//div[@class="flex h-full flex-col justify-between overflow-y-auto"]//div[@class="flex justify-center"]//*[@xmlns="http://www.w3.org/2000/svg"])[2]',
    );
    this.deviceSearchIcon = this.page.locator(
      '//div[@class="cursor-pointer rounded-lg border-1 border-brand-blue-shade1 p-custom4"]',
    );
    this.deviceSearchInput = this.page.locator('//input[@placeholder="Search"]');
    this.guestsModule = this.page.locator(
      '(//div[@class="flex h-full flex-col justify-between overflow-y-auto"]//div[@class="flex justify-center"]//*[@xmlns="http://www.w3.org/2000/svg"])[1]',
    );
    this.arrivalHeaders = this.page.locator('//thead//tr//th');
    this.guestsSearchIcon = this.page.locator(
      '//div[@class="group relative cursor-pointer rounded-lg border-1 border-brand-blue-shade1 p-custom4"]',
    );
    // reservation section details
    this.reservationDrawerLoader = this.page.locator(
      '//div[@class="mx-auto max-h-drawer rounded-lg border border-brand-gray-shade22 bg-white px-9 py-8 shadow-md"]',
    );
    this.guestFirstName = this.page.locator(
      '(//div[@class="flex h-full w-full flex-col "]//p[@class="lowercase first-letter:uppercase"])[1]',
    );
    this.guestLastName = this.page.locator(
      '(//div[@class="flex h-full w-full flex-col "]//p[@class="lowercase first-letter:uppercase"])[2]',
    );
    this.reservationStatus = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//div[contains(@class,"flex-shrink-0 rounded-3xl  px-7 py-2 font-Medium text-xs  bg-checkinStatus")]',
    );
    this.noOfAdultGuestsCount = this.page.locator(
      '((//div[@class="flex h-full w-full flex-col "]//*[@xmlns="http://www.w3.org/2000/svg"])[2]/following::div[@class="px-3 font-Bold leading-custom1"])[1]',
    );
    this.noOfChildrenGuestsCount = this.page.locator(
      '((//div[@class="flex h-full w-full flex-col "]//*[@xmlns="http://www.w3.org/2000/svg"])[2]/following::div[@class="px-3 font-Bold leading-custom1"])[2]',
    );
    this.stayDuration = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[@class="mb-0 py-2 font-Bold text-base text-brand-blue-shade1"]',
    );
    this.settlementType = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="Settlement Type"]/following-sibling::div',
    );
    this.biometric = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="Biometrics"]/following-sibling::div',
    );
    this.travelAgent = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="Travel Agent"]/following-sibling::div',
    );
    this.bookingSource = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="Booking Source"]/following-sibling::div',
    );
    this.reservationNotes = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="Reservation Notes"]/following-sibling::div//textarea[@placeholder="Add your comments"]',
    );
    this.addNotesBtn = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//button[@name="Add Note"]',
    );
    // Guest Details
    this.guestTab = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="Guest"]',
    );
    this.numberOfGuestsinGuestTab = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//div[@class="snap-center"]//p',
    );
    this.guestFName = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="First Name"]/following-sibling::div[contains(@class,"hyphens-manual")]',
    );
    this.guestLName = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="Last Name"]/following-sibling::div[contains(@class,"hyphens-manual")]',
    );
    this.gender = this.page.locator('//p[text()="Gender"]/following-sibling::div');
    this.dob = this.page.locator('//p[text()="Date of Birth"]/following-sibling::div');
    this.membershipNumber = this.page.locator(
      '//p[text()="Membership Number"]/following-sibling::div',
    );
    this.docType = this.page.locator('//p[text()="Document Type"]/following-sibling::div');
    this.docNumber = this.page.locator('//p[text()="Document Number"]/following-sibling::div');
    this.countryOfOrigin = this.page.locator(
      '//p[text()="Country of Origin"]/following-sibling::div',
    );
    this.nationality = this.page.locator('//p[text()="Nationality"]/following-sibling::div');
    this.phoneNumber = this.page.locator('//p[text()="Phone Number"]/following-sibling::div');
    this.email = this.page.locator('//p[text()="Email"]/following-sibling::div');
    this.countryOfIssue = this.page.locator(
      '//p[text()="Country of Issue"]/following-sibling::div',
    );
    this.birthPlace = this.page.locator('//p[text()="Birth Place"]/following-sibling::div');
    this.birthCountry = this.page.locator('//p[text()="Birth Country"]/following-sibling::div');
    this.scanIDButton = this.page.locator('//button[text()="scan id"]');
    // Manual Entry locators
    this.enterManuallyOptionBtn = this.page.locator('//p[text()="Enter Manually"]');
    this.manualEntryGuestDetails = this.page.locator(
      '//div[@class="my-5 flex flex-row justify-between font-RobotoRegular text-xl text-brand-blue-shade1 mobile:text-xxl"]//p',
    );
    this.firstNameInput = this.page.locator('//input[@id="firstName"]');
    this.lastNameInput = this.page.locator('//input[@id="lastName"]');
    this.genderDropdown = this.page.locator(
      '//p[text()="Gender"]/ancestor::div[contains(@data-component,"dropdown")]',
    );
    this.selectedGenderValue = this.page.locator('//p[text()="Gender"]/following::input[1]');
    this.genderOptionMale = this.page.locator('//div[text()="MALE"]');
    this.documentTypeDropdown = this.page.locator(
      '//p[text()="Document Type"]/ancestor::div[@data-component="dropdown"]',
    );
    this.documentTypeValue = this.page.locator('//p[text()="Document Type"]/following::input[1]');
    this.passportOption = this.page.locator('//div[@data-id="PASSPORT"]');
    this.documentNumberInput = this.page.locator('//input[@id="docNo"]');
    this.genderField = this.page.locator('(//input[@title="autocomplete"])[1]');
    this.documentIssueDateInput = this.page.locator(
      '//p[text()="Document Issue Date"]/following::input[@class="p-inputtext p-component"][1]',
    );
    this.documentExpiryDateInput = this.page.locator(
      '//p[text()="Document Expiry Date"]/following::input[@class="p-inputtext p-component"][1]',
    );
    this.dobInput = this.page.locator(
      '//p[text()="Date of Birth"]/following::input[@class="p-inputtext p-component"]',
    );
    this.datePicker = this.page.locator('//div[@class="p-datepicker-group-container"]');
    this.yearButton = this.page.locator('//button[@class="p-datepicker-year p-link"]');
    this.datePicketNextButton = this.page.locator('//button[@class="p-datepicker-next"]');
    this.datePicketPrevButton = this.page.locator('//button[@class="p-datepicker-prev"]');
    this.countryOfResidence = this.page.locator(
      '//p[text()="Country Of Residence"]/ancestor::div[@data-component="dropdown"]',
    );
    this.countryOfResidenceValue = this.page.locator(
      '//p[text()="Country Of Residence"]/following::input[1]',
    );
    this.countryOfResidenceOptionIndia = this.page.locator('(//div[@data-id="India"])[1]');
    this.nationalityDropdown = this.page.locator(
      '//p[text()="Nationality"]/ancestor::div[@data-component="dropdown"]',
    );
    this.nationalityValue = this.page.locator('//p[text()="Nationality"]/following::input[1]');
    this.nationalityOptionIndia = this.page.locator('(//div[@data-id="India"])[2]');
    this.countryOfIssueDropdown = this.page.locator(
      '//p[text()="Country Of Issue"]/ancestor::div[@data-component="dropdown"]',
    );
    this.countryOfIssueValue = this.page.locator(
      '//p[text()="Country Of Issue"]/following::input[1]',
    );
    this.countryOfIssueOptionIndia = this.page.locator('(//div[@data-id="India"])[3]');
    this.birthCountryDropdown = this.page.locator(
      '//p[text()="Birth Country"]/ancestor::div[@data-component="dropdown"]',
    );
    this.birthCountryValue = this.page.locator('//p[text()="Birth Country"]/following::input[1]');
    this.birthCountryOptionIndia = this.page.locator('(//div[@data-id="India"])[4]');
    this.birthPlaceInput = this.page.locator('//input[@id="birthPlace"]');
    this.confirmButton = this.page.locator('//button[text()="confirm"]');
    this.successToast = this.page.locator(
      '//p[text()="Successfully updated guest information in the PMS"]',
    );
    // E-reg flow
    this.reservationtab = this.page.locator(
      '//div[@class="flex h-full w-full flex-col "]//p[text()="Reservation"]',
    );
    this.eregButton = this.page.locator('//button[text()="E-REG"]');
    this.eregSelectionPage = this.page.locator(
      '//div[@class="font-Regular text-xl leading-none text-brand-gray-shade8 mobile:text-3xl-md ml-6"]',
    );
    this.selectGuest = this.page.locator('//p[@class="text-xxl text-brand-blue-shade1"]');
    this.selectionPageText = this.page.locator(
      '//p[@class="mt-5 text-lg leading-6 text-brand-gray-shade2"]',
    );
    this.selectAllCheckbox = this.page.locator(
      '(//span[text()="Select all"]/following::*[@class="overflow-visible"])[1]',
    );
    this.continueEregBtn = this.page.locator('//button[text()="continue"]');
    this.continueOnSidecar = this.page.locator(
      '(//p[@class="mr-12 text-left font-Regular text-base mobile:mb-5 mobile:mr-0 mobile:text-center"])[1]',
    );
    this.sidecarSelectionDropdown = this.page.locator(
      '//div[@class="flex gap-2 py-2"]//*[@xmlns="http://www.w3.org/2000/svg"]',
    );
    this.connectButton = this.page.locator('//button[@name="Connect"]');
    this.approvalPopup = this.page.locator(
      '//div[@class="relative z-20 flex h-full transform-gpu flex-row items-center justify-center duration-300 ease-in-out will-change-transform w-full translate-y-0 scale-100 opacity-100"]',
    );
    this.approvalPopupText = this.page.locator(
      '//p[@class="text-bg-bg-brand-blue-shade1 font-Medium text-xl mobile:text-2xl"]',
    );
    this.approveButton = this.page.locator('//button[text()="Approve"]');
    this.approveAllButton = this.page.locator(
      '//p[text()="Approve all"]/parent::div/preceding-sibling::div//*[@xmlns="http://www.w3.org/2000/svg"]',
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
  hudiniScLogo: Locator;
  deviceModule: Locator;
  deviceSearchIcon: Locator;
  deviceSearchInput: Locator;
  guestsModule: Locator;
  arrivalHeaders: Locator;
  guestsSearchIcon: Locator;
  reservationDrawerLoader: Locator;
  guestFirstName: Locator;
  guestLastName: Locator;
  reservationStatus: Locator;
  noOfAdultGuestsCount: Locator;
  noOfChildrenGuestsCount: Locator;
  stayDuration: Locator;
  settlementType: Locator;
  biometric: Locator;
  travelAgent: Locator;
  bookingSource: Locator;
  reservationNotes: Locator;
  addNotesBtn: Locator;
  guestTab: Locator;
  numberOfGuestsinGuestTab: Locator;
  guestFName: Locator;
  guestLName: Locator;
  gender: Locator;
  dob: Locator;
  membershipNumber: Locator;
  docType: Locator;
  docNumber: Locator;
  countryOfOrigin: Locator;
  nationality: Locator;
  phoneNumber: Locator;
  email: Locator;
  countryOfIssue: Locator;
  birthPlace: Locator;
  birthCountry: Locator;
  scanIDButton: Locator;
  enterManuallyOptionBtn: Locator;
  manualEntryGuestDetails: Locator;
  firstNameInput: Locator;
  lastNameInput: Locator;
  genderDropdown: Locator;
  selectedGenderValue: Locator;
  genderOptionMale: Locator;
  documentTypeDropdown: Locator;
  documentTypeValue: Locator;
  passportOption: Locator;
  documentNumberInput: Locator;
  genderField: Locator;
  documentIssueDateInput: Locator;
  documentExpiryDateInput: Locator;
  dobInput: Locator;
  datePicker: Locator;
  yearButton: Locator;
  datePicketNextButton: Locator;
  datePicketPrevButton: Locator;
  countryOfResidence: Locator;
  countryOfResidenceValue: Locator;
  nationalityDropdown: Locator;
  nationalityValue: Locator;
  countryOfIssueDropdown: Locator;
  countryOfIssueValue: Locator;
  birthCountryDropdown: Locator;
  birthCountryValue: Locator;
  birthPlaceInput: Locator;
  countryOfResidenceOptionIndia: Locator;
  nationalityOptionIndia: Locator;
  countryOfIssueOptionIndia: Locator;
  birthCountryOptionIndia: Locator;
  confirmButton: Locator;
  successToast: Locator;

  // Actions

  async launchAndLogin(TEST_URL: string, TEST_EMAIL: string) {
    await this.page.goto(TEST_URL);
    console.log('Launching StaffConnect URL');

    await expect(this.emailTxtBx).toBeVisible();
    await this.emailTxtBx.fill(TEST_EMAIL);
    console.log('Verification of visibility and filling of email text box is successful');

    await expect(this.continueBtn).toBeVisible();
    await this.continueBtn.click();
    console.log('Verification of visibility and clicking of continue button is successful');
  }
  async enterPassword(TEST_PASSWORD: string) {
    await expect(this.passwordTxtBx).toBeVisible();
    await this.passwordTxtBx.fill(TEST_PASSWORD);
    console.log('Verification of visibility and filling of password text box is successful');

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
  async verifySuccessfulLogin() {
    // Implement verification logic, e.g., check for a specific element that appears after login
    await expect(this.hudiniScLogo).toBeVisible();
    console.log(
      'Verification of successful login by checking visibility of Hudini SC logo is successful',
    );
  }
  async verifyCreatedSidearConnection(deviceIDFromSidecar: string) {
    // Implement verification logic, e.g., check for a sidecar element that appears after creation
    await expect(this.deviceModule).toBeVisible();
    await this.deviceModule.click();
    console.log(
      'Verification of visibility and clicking of device module in the sidecar main page is successful',
    );
    await expect(this.deviceSearchIcon).toBeVisible();
    await this.deviceSearchIcon.click();
    console.log(
      'Verification of visibility and clicking of device search icon in the device module is successful',
    );

    console.log('Shared Device ID:', deviceIDFromSidecar);

    await this.deviceSearchInput.fill(deviceIDFromSidecar);
    const createdDevice = this.page.locator(
      `(//tbody//tr)[1]//td//p[text()="${deviceIDFromSidecar}"]`,
    ); // Adjust the locator to target the correct element based on your application's structure
    await expect(createdDevice).toBeVisible();
    console.log(
      'Verification of visibility of the created sidecar connection in the device search results is successful',
    );
  }
  async verifyArrivalSection() {
    await expect(this.guestsModule).toBeVisible();
    await this.guestsModule.click();
    console.log(
      'Verification of visibility and clicking of guests module in the staffConnect main page is successful',
    );

    const arrivalHeadersText = await this.arrivalHeaders.allTextContents();
    arrivalHeadersText.forEach((header, index) => {
      console.log(`Header ${index + 1}: ${header}`);
    });
  }
  async verifyArrivalGuests(CONFIRMATION_NUMBER: string) {
    await expect(this.guestsSearchIcon).toBeVisible();
    await this.guestsSearchIcon.click();
    console.log(
      'Verification of visibility and clicking of guests search icon in the guests module is successful',
    );
    await this.deviceSearchInput.fill(CONFIRMATION_NUMBER);
    const searchedGuest = this.page.locator(
      `(//tbody//tr)[1]//td//p[text()="${CONFIRMATION_NUMBER}"]`,
    ); // Adjust the locator to target the correct element based on your application's structure
    await expect(searchedGuest).toBeVisible();
    console.log(
      'Verification of visibility of the searched guest in the guests search results is successful',
    );
    await searchedGuest.click();
    console.log('Verification of clicking of the searched guest is successful');
  }

  async verifyDetailsinReservationSection(HOTEL_ID: string, CONFIRMATION_NUMBER: string ) {

    const reservation = await this.fetchReservationApi.fetchReservationDetails(HOTEL_ID, CONFIRMATION_NUMBER);
    console.log('Fetched reservation details:', JSON.stringify(reservation, null, 2));

    if (reservation && typeof reservation === 'object') {
      const detailKeys = Object.keys(reservation);
      console.log('Reservation detail keys:', detailKeys);
    }
    try {
      await expect(this.reservationDrawerLoader).toBeHidden({ timeout: 10000 });

      // Guest First Name
      try {
        const guestFirstName = await this.guestFirstName.textContent();

        if (guestFirstName?.trim()) {
          console.log('Guest First Name:', guestFirstName.trim());
        } else {
          console.log('Guest First Name is empty');
        }
      } catch (error) {
        console.log('Guest First Name is not available');
      }

      // Guest Last Name
      try {
        const guestLastName = await this.guestLastName.textContent();

        if (guestLastName?.trim()) {
          console.log('Guest Last Name:', guestLastName.trim());
        } else {
          console.log('Guest Last Name is empty');
        }
      } catch (error) {
        console.log('Guest Last Name is not available');
      }

      // Reservation Status
      try {
        const reservationStatus = await this.reservationStatus.textContent();

        if (reservationStatus?.trim()) {
          console.log('Reservation Status:', reservationStatus.trim());
        } else {
          console.log('Reservation Status is empty');
        }
      } catch (error) {
        console.log('Reservation Status is not available');
      }

      // Number Of Guests Count
      try {
        const noOfAdultGuestsCount = await this.noOfAdultGuestsCount.textContent();

        if (noOfAdultGuestsCount?.trim()) {
          console.log('Number Of Adult Guests Count:', noOfAdultGuestsCount.trim());
        } else {
          console.log('Number Of Adult Guests Count is empty');
        }
      } catch (error) {
        console.log('Number Of Adult Guests Count is not available');
      }
      // Number Of Children Guests Count
      if (await this.noOfChildrenGuestsCount.isVisible().catch(() => false)) {
        const noOfChildrenGuestsCount = await this.noOfChildrenGuestsCount.textContent();
        console.log('Number Of Children Guests Count:', noOfChildrenGuestsCount?.trim());
      } else {
        console.log('Children Guest Count field is not present for this reservation');
      }

      // Stay Duration
      try {
        const stayDuration = await this.stayDuration.textContent();

        if (stayDuration?.trim()) {
          console.log('Stay Duration:', stayDuration.trim());
        } else {
          console.log('Stay Duration is empty');
        }
      } catch (error) {
        console.log('Stay Duration is not available');
      }

      // Settlement Type
      try {
        const settlementType = await this.settlementType.textContent();

        if (settlementType?.trim()) {
          console.log('Settlement Type:', settlementType.trim());
        } else {
          console.log('Settlement Type is empty');
        }
      } catch (error) {
        console.log('Settlement Type is not available');
      }

      // Biometric
      try {
        const biometric = await this.biometric.textContent();

        if (biometric?.trim()) {
          console.log('Biometric:', biometric.trim());
        } else {
          console.log('Biometric is empty');
        }
      } catch (error) {
        console.log('Biometric is not available');
      }

      // Travel Agent
      try {
        const travelAgent = await this.travelAgent.textContent();

        if (travelAgent?.trim()) {
          console.log('Travel Agent:', travelAgent.trim());
        } else {
          console.log('Travel Agent is empty');
        }
      } catch (error) {
        console.log('Travel Agent is not available');
      }

      // Booking Source
      try {
        const bookingSource = await this.bookingSource.textContent();
        if (bookingSource?.trim()) {
          console.log('Booking Source:', bookingSource.trim());
        } else {
          console.log('Booking Source is empty');
        }
      } catch (error) {
        console.log('Booking Source is not available');
      }
    } catch (error) {
      console.log('Verification of reservation details section failed');
      console.log(error);
    }
  }
  async verifyAddingNotesinReservationSection(RESERVATION_NOTE: string) {
    try {
      await expect(this.reservationNotes).toBeVisible();
      await this.reservationNotes.click();
      await this.reservationNotes.fill(RESERVATION_NOTE);
      console.log(
        'Verification of visibility and filling of reservation notes text area is successful',
      );
      await expect(this.addNotesBtn).toBeVisible();
      await this.addNotesBtn.click();
      console.log('Verification of visibility and clicking of add notes button is successful');
      // Add verification for the added note if necessary, e.g., check if the note appears in a list of notes
    } catch (error) {
      console.log('Verification of adding notes in reservation section failed');
      console.log(error);
    }
  }
  async verifyDetailsinGuestTab() {
    try {
      // Verify Guest Tab
      await expect(this.guestTab).toBeVisible();
      console.log('Guest Tab is visible');
      await this.guestTab.click();
      console.log('Clicked on Guest Tab successfully');
    } catch (error) {
      console.log('Guest Tab is not visible');
    }

    try {
      // Count number of guest elements
      const guestCount = await this.numberOfGuestsinGuestTab.count();
      console.log('Total Number Of Guests Found:', guestCount);
      if (guestCount > 0) {
        for (let i = 0; i < guestCount; i++) {
          await this.openGuestTab(); // Ensure the Guest Tab is open before interacting with guest elements
          const guestElement = await this.numberOfGuestsinGuestTab.nth(i);
          const guestText = await guestElement.textContent();
          console.log(`Guest ${i + 1}:`, guestText?.trim());

          // Click each guest one by one
          await guestElement.click();

          console.log(`Clicked on Guest ${i + 1} successfully`);

          //  validation after clicking on each guest;
          // Guest First Name
          try {
            await expect(this.guestFName).toBeVisible();
            const guestFirstName = await this.guestFName.textContent();
            console.log('Guest First Name:', guestFirstName?.trim());
          } catch (error) {
            console.log('Guest First Name is not available');
          }
          // Guest Last Name
          try {
            await expect(this.guestLName).toBeVisible();
            const guestLastName = await this.guestLName.textContent();
            console.log('Guest Last Name:', guestLastName?.trim());
          } catch (error) {
            console.log('Guest Last Name is not available');
          }
          // Gender
          try {
            await expect(this.gender).toBeVisible();
            const gender = await this.gender.textContent();
            console.log('Gender:', gender?.trim());
          } catch (error) {
            console.log('Gender is not available');
          }
          // Date of Birth
          try {
            await expect(this.dob).toBeVisible();
            const dob = await this.dob.textContent();
            console.log('Date of Birth:', dob?.trim());
          } catch (error) {
            console.log('Date of Birth is not available');
          }
          // Membership Number
          try {
            await expect(this.membershipNumber).toBeVisible();
            const membershipNumber = await this.membershipNumber.textContent();
            console.log('Membership Number:', membershipNumber?.trim());
          } catch (error) {
            console.log('Membership Number is not available');
          }
          // Document Type
          let docTypeText = '';
          try {
            await expect(this.docType).toBeVisible();
            docTypeText = (await this.docType.textContent())?.trim() || '';
            console.log('Document Type:', docTypeText);
          } catch (error) {
            console.log('Document Type is not available');
          }
          // Document Number
          let docNumberText = '';
          try {
            await expect(this.docNumber).toBeVisible();
            docNumberText = (await this.docNumber.textContent())?.trim() || '';
            console.log('Document Number:', docNumberText);
          } catch (error) {
            console.log('Document Number is not available');
          }
          // Country of Origin
          try {
            await expect(this.countryOfOrigin).toBeVisible();
            const countryOfOrigin = await this.countryOfOrigin.textContent();
            console.log('Country of Origin:', countryOfOrigin?.trim());
          } catch (error) {
            console.log('Country of Origin is not available');
          }
          // Nationality
          try {
            await expect(this.nationality).toBeVisible();
            const nationality = await this.nationality.textContent();
            console.log('Nationality:', nationality?.trim());
          } catch (error) {
            console.log('Nationality is not available');
          }
          // Phone Number
          try {
            await expect(this.phoneNumber).toBeVisible();
            const phoneNumber = await this.phoneNumber.textContent();
            console.log('Phone Number:', phoneNumber?.trim());
          } catch (error) {
            console.log('Phone Number is not available');
          }
          // Email
          try {
            await expect(this.email).toBeVisible();
            const email = await this.email.textContent();
            console.log('Email:', email?.trim());
          } catch (error) {
            console.log('Email is not available');
          }
          // Country of Issue
          try {
            await expect(this.countryOfIssue).toBeVisible();
            const countryOfIssue = await this.countryOfIssue.textContent();
            console.log('Country of Issue:', countryOfIssue?.trim());
          } catch (error) {
            console.log('Country of Issue is not available');
          }
          // Birth Place
          try {
            await expect(this.birthPlace).toBeVisible();
            const birthPlace = await this.birthPlace.textContent();
            console.log('Birth Place:', birthPlace?.trim());
          } catch (error) {
            console.log('Birth Place is not available');
          }
          // Birth Country
          try {
            await expect(this.birthCountry).toBeVisible();
            const birthCountry = await this.birthCountry.textContent();
            console.log('Birth Country:', birthCountry?.trim());
          } catch (error) {
            console.log('Birth Country is not available');
          }

          // Calling Manual entry verification method after clicking each guest
          await this.verifyManualEntryInGuestTab();

          // Optional wait
          await this.page.waitForTimeout(2000);
        }
      } else {
        console.log('No guests available in Guest Tab');
      }
    } catch (error) {
      console.log('Number Of Guests section is not visible');
      console.log(error);
    }
  }
  async openGuestTab() {
    await this.guestTab.waitFor({ state: 'visible' });
    await this.guestTab.click();
  }
  async verifyManualEntryInGuestTab() {
    let documentTypeText = '';
    let documentNumberText = '';
    // validation only when document type or document number is missing, then only click on Scan ID button to enter the details manually
    // Document Type
    try {
      await expect(this.docType).toBeVisible();
      documentTypeText = (await this.docType.textContent())?.trim() || '';
      console.log('Document Type:', documentTypeText);
    } catch (error) {
      console.log('Document Type is not available');
    }
    // Document Number
    try {
      await expect(this.docNumber).toBeVisible();
      documentNumberText = (await this.docNumber.textContent())?.trim() || '';
      console.log('Document Number:', documentNumberText);
    } catch (error) {
      console.log('Document Number is not available');
    }

    // Validation against missing document details and clicking on Scan ID button to enter the details manually
    if (documentTypeText === '-' || documentNumberText === '-') {
      console.log(
        'Document details are missing, clicking Scan ID button to enter the details manually',
      );
      const scanIdVisible = await this.scanIDButton.isVisible().catch(() => false);

      if (scanIdVisible) {
        console.log('Scan ID button is visible, proceeding with manual entry');

        await this.scanIDButton.click();
        console.log('Clicked on Scan ID button successfully');

        await expect(this.enterManuallyOptionBtn).toBeVisible();
        await this.enterManuallyOptionBtn.click();
        console.log('Clicked on Enter Manually option successfully');
      } else {
        console.log(
          'Scan ID button is NOT visible - likely child guest or already completed validation',
        );
        return; // or just skip manual entry flow
      }

      // First Name
      try {
        await expect(this.firstNameInput).toBeVisible();
        const firstNameValue = await this.firstNameInput.inputValue();

        if (firstNameValue.trim() !== '') {
          console.log('First Name already present:', firstNameValue);
        } else {
          await this.firstNameInput.fill('Arun');
          console.log('First Name was empty, added value: Arun');
        }
      } catch (error) {
        console.log('First Name field is not available');
      }
      // Last Name
      try {
        await expect(this.lastNameInput).toBeVisible();
        const lastNameValue = await this.lastNameInput.inputValue();
        if (lastNameValue.trim() !== '') {
          console.log('Last Name already present:', lastNameValue);
        } else {
          await this.lastNameInput.fill('Ramachandran');
          console.log('Last Name was empty, added value: Ramachandran');
        }
      } catch (error) {
        console.log('Last Name field is not available');
      }

      // Gender
      try {
        await expect(this.genderDropdown).toBeVisible();
        const genderValue = await this.selectedGenderValue.inputValue();

        if (genderValue.trim() !== '') {
          console.log('Gender already selected:', genderValue);
        } else {
          console.log('Gender value is empty, selecting gender');
          await this.genderDropdown.click();

          await expect(this.genderOptionMale).toBeVisible();
          await this.genderOptionMale.click();
          console.log('Selected Gender: MALE');
        }
      } catch (error) {
        console.log('Gender dropdown is not available');
      }

      // Document Type
      try {
        // Current selected value
        const documentTypeValue = await this.documentTypeValue.inputValue();

        if (documentTypeValue && documentTypeValue.trim() !== '') {
          console.log('Document Type already present:', documentTypeValue);
        } else {
          console.log('Document Type is empty');
          // Open dropdown
          await this.documentTypeDropdown.click();
          console.log('Clicked on Document Type dropdown');

          // Select Passport
          await this.passportOption.click();
          console.log('Selected Document Type: PASSPORT');
        }
      } catch (error) {
        console.log('Document Type section not available');
        console.log(error);
      }
      // Document Number
      try {
        await expect(this.documentNumberInput).toBeVisible();
        const documentNumber = await this.documentNumberInput.inputValue();

        if (documentNumber && documentNumber.trim() !== '') {
          console.log('Document Number already present:', documentNumber);
        } else {
          console.log('Document Number is empty, entering value');
          await this.documentNumberInput.fill('89392');

          console.log('Document Number entered successfully');
        }
      } catch (error) {
        console.log('Document Number field is not available');
      }
      // Document Issue Date
      try {
        await expect(this.documentIssueDateInput).toBeVisible();

        const issueDateValue = await this.documentIssueDateInput.inputValue();

        if (issueDateValue && issueDateValue.trim() !== '') {
          console.log('Document Issue Date already present:', issueDateValue);
        } else {
          console.log('Document Issue Date is empty, clicking field');

          await this.documentIssueDateInput.click();
          // Wait for calendar
          await expect(this.datePicker).toBeVisible();

          // Click Year button
          await this.yearButton.click();

          // Select required year = 2025
          let yearVisible = false;

          while (!yearVisible) {
            const yearLocator = this.page.locator('//span[text()="2025"]');

            if (await yearLocator.isVisible()) {
              await yearLocator.click();
              yearVisible = true;
            } else {
              // Click next or prev based on requirement
              await this.datePicketNextButton.click();

              // OR use prev button if needed
              // await this.datePicketPrevButton.click();
            }
          }

          // Select Month - January
          await this.page.locator('//span[text()="Jan"]').click();

          // Select Date - 1
          await this.page.locator('//td[@aria-label="01 Jan 2025"]').click();

          console.log('Document Issue Date selected successfully');
        }

        console.log('Clicked on Document Issue Date field successfully');
      } catch (error) {
        console.log('Document Issue Date field is not available');
      }
      // document expiry date and dob can be filled in the same way as document issue date based on the requirement
      // Document Expiry Date
      try {
        await expect(this.documentExpiryDateInput).toBeVisible();

        const expiryDateValue = await this.documentExpiryDateInput.inputValue();

        if (expiryDateValue && expiryDateValue.trim() !== '') {
          console.log('Document Expiry Date already present:', expiryDateValue);
        } else {
          console.log('Document Expiry Date is empty, clicking field');

          await this.documentExpiryDateInput.click();
          // Wait for calendar
          await expect(this.datePicker).toBeVisible();

          // Click Year button
          await this.yearButton.click();

          // Select required year = 2035
          let yearVisible = false;

          while (!yearVisible) {
            const yearLocator = this.page.locator('//span[text()="2035"]');

            if (await yearLocator.isVisible()) {
              await yearLocator.click();
              yearVisible = true;
            } else {
              // Click next or prev based on requirement
              await this.datePicketNextButton.click();

              // OR use prev button if needed
              // await this.datePicketPrevButton.click();
            }
          }

          // Select Month - January
          await this.page.locator('//span[text()="Jan"]').click();

          // Select Date - 1
          await this.page.locator('//td[@aria-label="01 Jan 2035"]').click();

          console.log('Document Expiry Date selected successfully');
        }

        console.log('Clicked on Document Expiry Date field successfully');
      } catch (error) {
        console.log('Document Expiry Date field is not available');
      }

      // country of residence
      try {
        // Current selected value
        const countryOfResidence = await this.countryOfResidenceValue.inputValue();

        if (countryOfResidence && countryOfResidence.trim() !== '') {
          console.log('Country of Residence already present:', countryOfResidence);
        } else {
          console.log('Country of Residence is empty');
          // Open dropdown
          await this.countryOfResidence.click();
          console.log('Clicked on Country of Residence dropdown');

          // Select India
          await this.countryOfResidenceOptionIndia.click();
          console.log('Selected Country of Residence: INDIA');
        }
      } catch (error) {
        console.log('Country of Residence section not available');
        console.log(error);
      }

      // Nationality
      try {
        // Current selected value
        const nationality = await this.nationalityValue.inputValue();

        if (nationality && nationality.trim() !== '') {
          console.log('Nationality already present:', nationality);
        } else {
          console.log('Nationality is empty');
          // Open dropdown
          await this.nationalityDropdown.click();
          console.log('Clicked on Nationality dropdown');

          // Select India
          await this.nationalityOptionIndia.click();
          console.log('Selected Nationality: INDIA');
        }
      } catch (error) {
        console.log(' Nationality section not available');
        console.log(error);
      }

      // country of issue
      try {
        // Current selected value
        const countryOfIssue = await this.countryOfIssueValue.inputValue();

        if (countryOfIssue && countryOfIssue.trim() !== '') {
          console.log('Country of Issue already present:', countryOfIssue);
        } else {
          console.log('Country of Issue is empty');
          // Open dropdown
          await this.countryOfIssueDropdown.click();
          console.log('Clicked on Country of Issue dropdown');

          // Select India
          await this.countryOfIssueOptionIndia.click();
          console.log('Selected Country of Issue: INDIA');
        }
      } catch (error) {
        console.log(' Country of Issue section not available');
        console.log(error);
      }

      // birth country
      try {
        // Current selected value
        const birthCountry = await this.birthCountryValue.inputValue();

        if (birthCountry && birthCountry.trim() !== '') {
          console.log('Birth Country already present:', birthCountry);
        } else {
          console.log('Birth Country is empty');
          // Open dropdown
          await this.birthCountryDropdown.click();
          console.log('Clicked on Birth Country dropdown');

          // Select India
          await this.birthCountryOptionIndia.click();
          console.log('Selected Birth Country: INDIA');
        }
      } catch (error) {
        console.log(' Birth Country section not available');
        console.log(error);
      }

      // birth place
      try {
        await expect(this.birthPlaceInput).toBeVisible();
        const birthPlace = await this.birthPlaceInput.inputValue();

        if (birthPlace && birthPlace.trim() !== '') {
          console.log('Birth Place already present:', birthPlace);
        } else {
          console.log('Birth Place is empty, entering value');
          await this.birthPlaceInput.fill('Mumbai');

          console.log('Birth Place entered successfully');
        }
      } catch (error) {
        console.log('Birth Place field is not available');
      }
      // After entering all the details click on confirm button
      try {
        await expect(this.confirmButton).toBeVisible();
        await this.confirmButton.click();
        console.log('Clicked on Confirm button successfully');
      } catch (error) {
        console.log('Confirm button is not available');
      }
      // Wait for the success toast to appear
      try {
        await expect(this.successToast).toBeVisible({ timeout: 10000 });
        console.log('Success toast is visible');
      } catch (error) {
        console.log('Success toast is not available');
      }
    } else {
      console.log('Document details already present');
    }
  }

  // E-reg flow locators
  reservationtab: Locator;
  eregButton: Locator;
  eregSelectionPage: Locator;
  selectGuest: Locator;
  selectionPageText: Locator;
  selectAllCheckbox: Locator;
  continueEregBtn: Locator;
  continueOnSidecar: Locator;
  sidecarSelectionDropdown: Locator;
  connectButton: Locator;

  async verifyEregFlow(SIDECAR_DEVICE: string) {
    // After manual entry, verify that the guest details are updated correctly

    try {
      await expect(this.reservationtab).toBeVisible();
      await this.reservationtab.click();
      console.log('Clicked on Reservation tab successfully');
      try {
        await expect(this.eregButton).toBeVisible();
        await this.eregButton.click();
        console.log('Clicked on Ereg button successfully');
      } catch (error) {
        console.log('Ereg button is not available');
      }
      try {
        await expect(this.eregSelectionPage).toBeVisible();
        console.log('Ereg Selection Page is visible');
        const eregSelectionPageText = await this.eregSelectionPage.textContent();
        console.log('Ereg Selection Page Text:', eregSelectionPageText?.trim());
      } catch (error) {
        console.log('Ereg Selection Page is not available');
      }
      try {
        await expect(this.selectGuest).toBeVisible();
        console.log('Select Guest option is visible');
        const selectGuestText = await this.selectGuest.textContent();
        console.log('Select Guest Text:', selectGuestText?.trim());
      } catch (error) {
        console.log('Select Guest option is not available');
      }
      try {
        await expect(this.selectionPageText).toBeVisible();
        const selectionPageTextContent = await this.selectionPageText.textContent();
        console.log('Selection Page Text Content:', selectionPageTextContent?.trim());
      } catch (error) {
        console.log('Selection Page Text is not available');
      }

      try {
        await expect(this.selectAllCheckbox).toBeVisible();
        await this.selectAllCheckbox.click();
        console.log('Checked Select All checkbox successfully');
      } catch (error) {
        console.log('Select All checkbox is not available');
      }
      try {
        await expect(this.continueEregBtn).toBeVisible();
        await this.continueEregBtn.click();
        console.log('Clicked on Continue button in Ereg flow successfully');
      } catch (error) {
        console.log('Continue button in Ereg flow is not available');
      }
      try {
        await expect(this.continueOnSidecar).toBeVisible();
        await this.continueOnSidecar.click();
        console.log('Clicked on Continue button on Sidecar successfully');
      } catch (error) {
        console.log('Continue button on Sidecar is not available');
      }
      try {
        await expect(this.sidecarSelectionDropdown).toBeVisible();
        await this.sidecarSelectionDropdown.click();
        console.log('Clicked on Sidecar selection dropdown successfully');

        // sidecar selection in the dropdown
        const selectedOption = this.page.locator(
          `(//div[@class="z-50 overflow-y-auto"])[3]//div[text()="${SIDECAR_DEVICE}"]`,
        );
        await expect(selectedOption).toBeVisible();
        await selectedOption.click();
        console.log(`Selected ${SIDECAR_DEVICE} from dropdown successfully`);

        // Click on connect Button
        await expect(this.connectButton).toBeVisible();
        await this.connectButton.click();
        console.log('Clicked on Connect button successfully');
      } catch (error) {
        console.log('Sidecar selection dropdown is not available');
      }
    } catch (error) {
      console.log('Verification of Ereg flow failed');
      console.log(error);
    }
  }
  approvalPopup: Locator;
  approvalPopupText: Locator;
  approveButton: Locator;
  approveAllButton: Locator;
  async validateApprovalPopup() {
    // Swictching back to staff Connect

    try {
      await this.page.bringToFront();
      await this.approvalPopup.waitFor({ state: 'visible', timeout: 30000 });
      console.log('Approval popup is displayed');

      const popupText = (await this.approvalPopupText.textContent())?.trim() || '';
      console.log(`Approval Popup Text: ${popupText}`);

      // Check if Approve All button exists
      const approveAllCount = await this.approveAllButton.count();
      console.log(`Approve All button count: ${approveAllCount}`);

      if (approveAllCount > 0 && (await this.approveAllButton.first().isVisible())) {
        console.log('Approve All button is available');

        await this.approveAllButton.click();
        console.log('Clicked Approve All button');
      } else {
        console.log('Approve All button not available');

        const approveButtonCount = await this.approveButton.count();
        console.log(`Total Approve buttons found: ${approveButtonCount}`);

        for (let i = 0; i < approveButtonCount; i++) {
          const button = this.approveButton.nth(i);

          if (await button.isVisible()) {
            await button.click();
            console.log(`Clicked Approve button ${i + 1}`);
          }
        }
      }
    } catch (e) {
      console.log('Approval popup is not displayed');
      console.log(e);
    }
  }
}
