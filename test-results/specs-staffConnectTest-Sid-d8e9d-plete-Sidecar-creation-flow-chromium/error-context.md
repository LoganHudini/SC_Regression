# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\staffConnectTest.spec.ts >> Sidecar + StaffConnect Flow >> Complete Sidecar creation flow
- Location: tests\specs\staffConnectTest.spec.ts:80:7

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('//div[@class="flex flex-row items-center justify-between"]')

```

# Test source

```ts
  137 |       '//p[text()="Date of Birth"]/parent::div/following-sibling::div//div//span//input[@id="dob"]',
  138 |     );
  139 |     this.addressLine1 = this.page.locator(
  140 |       '//p[text()="Address Line 1"]/parent::div/following-sibling::div//input[@id="addressLine"]',
  141 |     );
  142 |     this.addressLine2 = this.page.locator(
  143 |       '//p[text()="Address Line 2"]/parent::div/following-sibling::div//input[@id="addressLine2"]',
  144 |     );
  145 |     this.city = this.page.locator(
  146 |       '//p[text()="City"]/parent::div/following-sibling::div//input[@id="cityName"]',
  147 |     );
  148 |     this.state = this.page.locator(
  149 |       '//p[text()="State"]/parent::div/following-sibling::div//input[@id="stateProv"]',
  150 |     );
  151 |     this.placeOfIssue = this.page.locator(
  152 |       '//p[text()="Place of Issue"]/parent::div/following-sibling::div//input[@name="placeOfIssue"]',
  153 |     );
  154 |     this.countryOfResidence = this.page.locator(
  155 |       '//p[text()="Country Of Residence"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
  156 |     );
  157 |     this.postalCode = this.page.locator(
  158 |       '//p[text()="Postal Code"]/parent::div/following-sibling::div//input[@id="postalCode"]',
  159 |     );
  160 |     this.nationality = this.page.locator(
  161 |       '//p[text()="Nationality"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
  162 |     );
  163 |     this.countryOfIssue = this.page.locator(
  164 |       '//p[text()="Country of Issue"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
  165 |     );
  166 |     this.birthCountry = this.page.locator(
  167 |       '//p[text()="Birth Country"]/parent::div/following-sibling::div//input[@title="autocomplete"]',
  168 |     );
  169 |     this.birthPlace = this.page.locator(
  170 |       '//p[text()="Birth Place"]/parent::div/following-sibling::div//input[@name="birthPlace"]',
  171 |     );
  172 |     this.membershipNumber = this.page.locator(
  173 |       '//p[text()="Membership Number"]/parent::div/following-sibling::div//input[@name="membershipNumber"]',
  174 |     );
  175 |     this.membershipType = this.page.locator(
  176 |       '//p[text()="Membership Type"]/parent::div/following-sibling::div//input[@name="membershipType"]',
  177 |     );
  178 |     this.signatureSection = this.page.locator(
  179 |       '//p[text()="Guest Signature"]/parent::div/parent::div/following-sibling::div//canvas[@class="border-brand-gray-shade3 border-1 bg-[#F4F6FD] h-full w-full rounded-lg"]',
  180 |     );
  181 |     this.termsandconditions = this.page.locator('//p[@class="pr-1 text-wrap font-Regular"]');
  182 |     this.termsandconditionCheckBox = this.page.locator(
  183 |       '//p[@class="pr-1 text-wrap font-Regular"]/parent::div/preceding-sibling::div//*[@xmlns="http://www.w3.org/2000/svg"]',
  184 |     );
  185 |     this.submitButton = this.page.locator('//button[text()="Submit for approval"]');
  186 |     this.waitPopup = this.page.locator(
  187 |       '//div[@class="relative z-20 flex h-full transform-gpu flex-row items-center justify-center duration-300 ease-in-out will-change-transform w-full translate-y-0 scale-100 opacity-100"]',
  188 |     );
  189 |     this.popupText = this.page.locator(
  190 |       '//p[@class="flex text-center font-Medium text-2xl leading-relaxed text-brand-blue-shade1 desktop:text-xl"]',
  191 |     );
  192 |     this.thankyouPage = this.page.locator('//p[@class="mt-6 font-Medium text-xl"]');
  193 |     this.postApprovalPopupText = this.page.locator(
  194 |       '//span[text()="Information has been verified. "]',
  195 |     );
  196 |   }
  197 | 
  198 |   // Locators
  199 |   emailTxtBx: Locator;
  200 |   continueBtn: Locator;
  201 |   passwordTxtBx: Locator;
  202 |   loginBtn: Locator;
  203 |   propertyDropdown: Locator;
  204 |   propertyOptions: Locator;
  205 |   propertyContinueBtn: Locator;
  206 |   deviceIdText: Locator;
  207 |   deviceInput: Locator;
  208 |   connectSidecarBtn: Locator;
  209 | 
  210 |   sharedDeviceID = '';
  211 | 
  212 |   // Actions
  213 | 
  214 |   async launchAndLogin(TEST_URL: string, TEST_EMAIL: string) {
  215 |     await this.page.goto(TEST_URL);
  216 |     console.log('Launching Sidecar URL');
  217 | 
  218 |     await expect(this.emailTxtBx).toBeVisible();
  219 |     await this.emailTxtBx.fill(TEST_EMAIL);
  220 |     console.log('Verification of visibility and filling of email textbox is successful');
  221 | 
  222 |     await expect(this.continueBtn).toBeVisible();
  223 |     await this.continueBtn.click();
  224 |     console.log('Verification of visibility and clicking of continue button is successful');
  225 |   }
  226 |   async enterPassword(TEST_PASSWORD: string) {
  227 |     await expect(this.passwordTxtBx).toBeVisible();
  228 |     await this.passwordTxtBx.fill(TEST_PASSWORD);
  229 |     console.log('Verification of visibility and filling of password textbox is successful');
  230 | 
  231 |     await expect(this.loginBtn).toBeVisible();
  232 |     await this.loginBtn.click();
  233 |     console.log('Verification of visibility and clicking of login button is successful');
  234 |   }
  235 | 
  236 |   async selectProperty(TEST_PROPERTY: string) {
> 237 |     await this.propertyDropdown.click();
      |                                 ^ Error: locator.click: Target page, context or browser has been closed
  238 | 
  239 |     const propertyOption = this.page.locator(`//div[text()='${TEST_PROPERTY}']`);
  240 |     await expect(propertyOption).toBeVisible();
  241 |     await propertyOption.click();
  242 |     console.log(
  243 |       'Verification of visibility and clicking of property option in the property selection dropdown is successful',
  244 |     );
  245 | 
  246 |     await expect(this.propertyContinueBtn).toBeVisible();
  247 |     await this.propertyContinueBtn.click();
  248 |     console.log(
  249 |       'Verification of visibility and clicking of property continue button is successful',
  250 |     );
  251 |   }
  252 | 
  253 |   async connectSidecar(TEST_DEVICE: string) {
  254 |     const deviceText = await this.deviceIdText.textContent();
  255 | 
  256 |     this.sharedDeviceID = deviceText?.replace(/\D/g, '') || '';
  257 |     console.log('Device ID from UI:', this.sharedDeviceID);
  258 | 
  259 |     await this.deviceInput.fill(TEST_DEVICE);
  260 |     console.log('Verification of visibility and filling of device input is successful');
  261 | 
  262 |     await this.connectSidecarBtn.waitFor({ state: 'visible', timeout: 3000 });
  263 |     await this.connectSidecarBtn.click();
  264 |     console.log('Verification of visibility and clicking of connect sidecar button is successful');
  265 |   }
  266 | 
  267 |   async verifySidecarConnection(expectedText?: string) {
  268 |     // If an expected text is provided, verify the sidecar UI shows it
  269 |     if (expectedText) {
  270 |       await expect(this.page.locator('//p[contains(@class,"py-2")]')).toHaveText(expectedText);
  271 |       console.log('Verification of expected text in sidecar UI is successful');
  272 |     }
  273 | 
  274 |     // Wait for the URL to include a deviceId query parameter (e.g. ?deviceId=12345)
  275 |     // Some apps navigate client-side and the URL may update slightly after the UI change,
  276 |     // so wait a short time for that to happen.
  277 |     try {
  278 |       await this.page.waitForURL(/deviceId=\d+/, { timeout: 10000 });
  279 |     } catch (err) {
  280 |       const currentUrl = this.page.url();
  281 |       console.error('Timed out waiting for deviceId in URL. Current URL:', currentUrl);
  282 |       throw new Error('DeviceId not present in URL after connection — current URL: ' + currentUrl);
  283 |     }
  284 | 
  285 |     const currentUrl = this.page.url();
  286 |     console.log('Current URL after wait:', currentUrl);
  287 | 
  288 |     const match = currentUrl.match(/deviceId=(\d+)/);
  289 |     const deviceIdFromUrl = match ? match[1] : '';
  290 |     console.log('Device ID from URL:', deviceIdFromUrl);
  291 | 
  292 |     if (!this.sharedDeviceID) {
  293 |       console.error(
  294 |         'sharedDeviceID is empty. It should be set earlier in the flow (connectSidecar).',
  295 |       );
  296 |       throw new Error('sharedDeviceID was not set before verifySidecarConnection');
  297 |     }
  298 | 
  299 |     // Final assertion: the device ID captured from the UI before connection should match the ID in the URL
  300 |     expect(this.sharedDeviceID).toBe(deviceIdFromUrl);
  301 |     console.log('Verification of device ID in URL matching the shared device ID is successful');
  302 |   }
  303 |   getSharedDeviceID(): string {
  304 |     return this.sharedDeviceID;
  305 |   }
  306 |   async verifyReservationReceived() {
  307 |     console.log('Switching back to Sidecar');
  308 |     await this.page.bringToFront();
  309 |     // Optional wait for sync
  310 |     await this.page.waitForTimeout(5000);
  311 | 
  312 |     // Optional refresh if Sidecar doesn't auto-update
  313 |     await this.page.reload();
  314 |     console.log('Sidecar screen refreshed');
  315 |   }
  316 | 
  317 |   // e-reg stay info locators:
  318 |   loyaltyPopup: Locator;
  319 |   loyaltyPopupText: Locator;
  320 |   guestsInsideLoyaltyPopup: Locator;
  321 |   guestsnameInsideLoyaltyPopup: Locator;
  322 |   selectionCheckBox: Locator;
  323 |   joinLoyaltyButton: Locator;
  324 |   reviewandSignPageTitle: Locator;
  325 |   titleText: Locator;
  326 |   stayInfo: Locator;
  327 |   bookingID: Locator;
  328 |   roomNumber: Locator;
  329 |   checkInDate: Locator;
  330 |   checkOutDate: Locator;
  331 |   guestCountInEreg: Locator;
  332 |   roomType: Locator;
  333 |   settlementType: Locator;
  334 |   totalCostOfStay: Locator;
  335 | 
  336 |   async verifyEregpageDetails() {
  337 |     try {
```