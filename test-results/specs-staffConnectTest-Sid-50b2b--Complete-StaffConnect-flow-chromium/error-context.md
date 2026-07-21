# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\staffConnectTest.spec.ts >> Sidecar + StaffConnect Flow >> Complete StaffConnect flow
- Location: tests\specs\staffConnectTest.spec.ts:112:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('//input[@id="password"]')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for locator('//input[@id="password"]')

```

```yaml
- main:
  - region "Notifications alt+T"
  - img: Staff Connect
  - textbox: comoauto1@yopmail.com
  - button "continue" [disabled]
- alert
```

# Test source

```ts
  221 |     this.approveAllButton = this.page.locator(
  222 |       '//p[text()="Approve all"]/parent::div/preceding-sibling::div//*[@xmlns="http://www.w3.org/2000/svg"]',
  223 |     );
  224 |   }
  225 | 
  226 |   // Locators
  227 |   emailTxtBx: Locator;
  228 |   continueBtn: Locator;
  229 |   passwordTxtBx: Locator;
  230 |   loginBtn: Locator;
  231 |   propertyDropdown: Locator;
  232 |   propertyOptions: Locator;
  233 |   propertyContinueBtn: Locator;
  234 |   hudiniScLogo: Locator;
  235 |   deviceModule: Locator;
  236 |   deviceSearchIcon: Locator;
  237 |   deviceSearchInput: Locator;
  238 |   guestsModule: Locator;
  239 |   arrivalHeaders: Locator;
  240 |   guestsSearchIcon: Locator;
  241 |   reservationDrawerLoader: Locator;
  242 |   guestFirstName: Locator;
  243 |   guestLastName: Locator;
  244 |   reservationStatus: Locator;
  245 |   noOfAdultGuestsCount: Locator;
  246 |   noOfChildrenGuestsCount: Locator;
  247 |   stayDuration: Locator;
  248 |   settlementType: Locator;
  249 |   biometric: Locator;
  250 |   travelAgent: Locator;
  251 |   bookingSource: Locator;
  252 |   reservationNotes: Locator;
  253 |   addNotesBtn: Locator;
  254 |   guestTab: Locator;
  255 |   numberOfGuestsinGuestTab: Locator;
  256 |   guestFName: Locator;
  257 |   guestLName: Locator;
  258 |   gender: Locator;
  259 |   dob: Locator;
  260 |   membershipNumber: Locator;
  261 |   docType: Locator;
  262 |   docNumber: Locator;
  263 |   countryOfOrigin: Locator;
  264 |   nationality: Locator;
  265 |   phoneNumber: Locator;
  266 |   email: Locator;
  267 |   countryOfIssue: Locator;
  268 |   birthPlace: Locator;
  269 |   birthCountry: Locator;
  270 |   scanIDButton: Locator;
  271 |   enterManuallyOptionBtn: Locator;
  272 |   manualEntryGuestDetails: Locator;
  273 |   firstNameInput: Locator;
  274 |   lastNameInput: Locator;
  275 |   genderDropdown: Locator;
  276 |   selectedGenderValue: Locator;
  277 |   genderOptionMale: Locator;
  278 |   documentTypeDropdown: Locator;
  279 |   documentTypeValue: Locator;
  280 |   passportOption: Locator;
  281 |   documentNumberInput: Locator;
  282 |   genderField: Locator;
  283 |   documentIssueDateInput: Locator;
  284 |   documentExpiryDateInput: Locator;
  285 |   dobInput: Locator;
  286 |   datePicker: Locator;
  287 |   yearButton: Locator;
  288 |   datePicketNextButton: Locator;
  289 |   datePicketPrevButton: Locator;
  290 |   countryOfResidence: Locator;
  291 |   countryOfResidenceValue: Locator;
  292 |   nationalityDropdown: Locator;
  293 |   nationalityValue: Locator;
  294 |   countryOfIssueDropdown: Locator;
  295 |   countryOfIssueValue: Locator;
  296 |   birthCountryDropdown: Locator;
  297 |   birthCountryValue: Locator;
  298 |   birthPlaceInput: Locator;
  299 |   countryOfResidenceOptionIndia: Locator;
  300 |   nationalityOptionIndia: Locator;
  301 |   countryOfIssueOptionIndia: Locator;
  302 |   birthCountryOptionIndia: Locator;
  303 |   confirmButton: Locator;
  304 |   successToast: Locator;
  305 | 
  306 |   // Actions
  307 | 
  308 |   async launchAndLogin(TEST_URL: string, TEST_EMAIL: string) {
  309 |     await this.page.goto(TEST_URL);
  310 |     console.log('Launching StaffConnect URL');
  311 | 
  312 |     await expect(this.emailTxtBx).toBeVisible();
  313 |     await this.emailTxtBx.fill(TEST_EMAIL);
  314 |     console.log('Verification of visibility and filling of email text box is successful');
  315 | 
  316 |     await expect(this.continueBtn).toBeVisible();
  317 |     await this.continueBtn.click();
  318 |     console.log('Verification of visibility and clicking of continue button is successful');
  319 |   }
  320 |   async enterPassword(TEST_PASSWORD: string) {
> 321 |     await expect(this.passwordTxtBx).toBeVisible();
      |                                      ^ Error: expect(locator).toBeVisible() failed
  322 |     await this.passwordTxtBx.fill(TEST_PASSWORD);
  323 |     console.log('Verification of visibility and filling of password text box is successful');
  324 | 
  325 |     await expect(this.loginBtn).toBeVisible();
  326 |     await this.loginBtn.click();
  327 |     console.log('Verification of visibility and clicking of login button is successful');
  328 |   }
  329 | 
  330 |   async selectProperty(TEST_PROPERTY: string) {
  331 |     await this.propertyDropdown.click();
  332 | 
  333 |     const propertyOption = this.page.locator(`//div[text()='${TEST_PROPERTY}']`);
  334 |     await expect(propertyOption).toBeVisible();
  335 |     await propertyOption.click();
  336 |     console.log(
  337 |       'Verification of visibility and clicking of property option in the property selection dropdown is successful',
  338 |     );
  339 | 
  340 |     await expect(this.propertyContinueBtn).toBeVisible();
  341 |     await this.propertyContinueBtn.click();
  342 |     console.log(
  343 |       'Verification of visibility and clicking of property continue button is successful',
  344 |     );
  345 |   }
  346 |   async verifySuccessfulLogin() {
  347 |     // Implement verification logic, e.g., check for a specific element that appears after login
  348 |     await expect(this.hudiniScLogo).toBeVisible();
  349 |     console.log(
  350 |       'Verification of successful login by checking visibility of Hudini SC logo is successful',
  351 |     );
  352 |   }
  353 |   async verifyCreatedSidearConnection(deviceIDFromSidecar: string) {
  354 |     // Implement verification logic, e.g., check for a sidecar element that appears after creation
  355 |     await expect(this.deviceModule).toBeVisible();
  356 |     await this.deviceModule.click();
  357 |     console.log(
  358 |       'Verification of visibility and clicking of device module in the sidecar main page is successful',
  359 |     );
  360 |     await expect(this.deviceSearchIcon).toBeVisible();
  361 |     await this.deviceSearchIcon.click();
  362 |     console.log(
  363 |       'Verification of visibility and clicking of device search icon in the device module is successful',
  364 |     );
  365 | 
  366 |     console.log('Shared Device ID:', deviceIDFromSidecar);
  367 | 
  368 |     await this.deviceSearchInput.fill(deviceIDFromSidecar);
  369 |     const createdDevice = this.page.locator(
  370 |       `(//tbody//tr)[1]//td//p[text()="${deviceIDFromSidecar}"]`,
  371 |     ); // Adjust the locator to target the correct element based on your application's structure
  372 |     await expect(createdDevice).toBeVisible();
  373 |     console.log(
  374 |       'Verification of visibility of the created sidecar connection in the device search results is successful',
  375 |     );
  376 |   }
  377 |   async verifyArrivalSection() {
  378 |     await expect(this.guestsModule).toBeVisible();
  379 |     await this.guestsModule.click();
  380 |     console.log(
  381 |       'Verification of visibility and clicking of guests module in the staffConnect main page is successful',
  382 |     );
  383 | 
  384 |     const arrivalHeadersText = await this.arrivalHeaders.allTextContents();
  385 |     arrivalHeadersText.forEach((header, index) => {
  386 |       console.log(`Header ${index + 1}: ${header}`);
  387 |     });
  388 |   }
  389 |   async verifyArrivalGuests(CONFIRMATION_NUMBER: string) {
  390 |     await expect(this.guestsSearchIcon).toBeVisible();
  391 |     await this.guestsSearchIcon.click();
  392 |     console.log(
  393 |       'Verification of visibility and clicking of guests search icon in the guests module is successful',
  394 |     );
  395 |     await this.deviceSearchInput.fill(CONFIRMATION_NUMBER);
  396 |     const searchedGuest = this.page.locator(
  397 |       `(//tbody//tr)[1]//td//p[text()="${CONFIRMATION_NUMBER}"]`,
  398 |     ); // Adjust the locator to target the correct element based on your application's structure
  399 |     await expect(searchedGuest).toBeVisible();
  400 |     console.log(
  401 |       'Verification of visibility of the searched guest in the guests search results is successful',
  402 |     );
  403 |     await searchedGuest.click();
  404 |     console.log('Verification of clicking of the searched guest is successful');
  405 |   }
  406 | 
  407 |   async verifyDetailsinReservationSection(HOTEL_ID: string, CONFIRMATION_NUMBER: string ) {
  408 | 
  409 |     const reservation = await this.fetchReservationApi.fetchReservationDetails(HOTEL_ID, CONFIRMATION_NUMBER);
  410 |     console.log('Fetched reservation details:', reservation);
  411 |     try {
  412 |       await expect(this.reservationDrawerLoader).toBeHidden({ timeout: 10000 });
  413 | 
  414 |       // Guest First Name
  415 |       try {
  416 |         const guestFirstName = await this.guestFirstName.textContent();
  417 | 
  418 |         if (guestFirstName?.trim()) {
  419 |           console.log('Guest First Name:', guestFirstName.trim());
  420 |         } else {
  421 |           console.log('Guest First Name is empty');
```