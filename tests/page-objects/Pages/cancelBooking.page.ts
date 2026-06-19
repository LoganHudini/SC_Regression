import { Page, Locator } from '@playwright/test';

export class CancelBookingPage {
  private page: Page;
  private getStartedButton: Locator;
  public roomNo: Locator;
  private lastName: Locator;
  public nextButton: Locator;
  private myItineraryButton: Locator;
  private activitiesInMyItinerary: Locator;
  private cancelButton: Locator;
  private cancelActivityDrawer: Locator;
  private yesButton: Locator;
  private toastMessage: Locator;
  private toastMessageText: Locator;
  private toastMessageDescription: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedButton = this.page.getByRole('button', { name: 'Get Started' });
    this.roomNo = page.locator('input[name="roomNo"]');
    this.lastName = page.locator('input[name="lastName"]');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.myItineraryButton = page.getByRole('button', { name: 'my itinerary' });
    this.activitiesInMyItinerary = page.locator(
      '//span[@class="activityAndItinerary_cardTitle__Eaz_g"]',
    );
    this.cancelButton = page.getByRole('button', { name: 'CANCEL' });
    this.cancelActivityDrawer = page.locator(
      '//div[@class="activity-details_cancelWrapper__9pU3Y"]',
    );
    this.yesButton = page.getByRole('button', { name: 'YES' });
    this.toastMessage = page.locator('//div[@class="Notification_contentWrapper__trX5v"]');
    this.toastMessageText = page.locator('//p[@class="Notification_title__5bQnp"]');
    this.toastMessageDescription = page.locator('//p[@class="Notification_description__YSdhB"]');
  }

  async open() {
    await this.page.goto('https://fairmont.hudinielevate-stage.io/en/fairmont-mumbai/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  }

  async clickGetStarted() {
    // Handle initial connection
    // Wait for and click the "Get Started" button
    await this.getStartedButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.getStartedButton.click();

    // Fill in booking details
    await this.roomNo.waitFor({ state: 'visible' });
    await this.roomNo.fill('1602');
    await this.lastName.fill('M');
    await this.nextButton.click();
  }

  // Navigate to My Itinerary
  async navigateToMyItinerary() {
    // Wait for the home page to load after login
    await this.myItineraryButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.myItineraryButton.click();
  }

  async selectActivityInMyItinerary(activityName?: string) {
    // Wait for at least one activity to be visible
    await this.activitiesInMyItinerary.waitFor({ state: 'visible', timeout: 10000 });

    const count = await this.activitiesInMyItinerary.count();
    console.log(`Found ${count} activities in My Itinerary`);

    for (let i = 0; i < count; i++) {
      const text = (await this.activitiesInMyItinerary.nth(i).textContent())?.trim();
      console.log(`${i + 1}. ${text}`);
    }

    // If an activity name is provided, try to click that one; otherwise click the first
    if (activityName) {
      const target = this.activitiesInMyItinerary.filter({ hasText: activityName }).first();
      await target.click();
    } else {
      await this.activitiesInMyItinerary.first().click();
    }
  }

  async cancelBooking() {
    await this.cancelButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.cancelButton.click();

    // waiting for cancel activity drawer to be visible
    await this.cancelActivityDrawer.waitFor({ state: 'visible', timeout: 10000 });
    await this.cancelActivityDrawer.click();

    // waiting for yes button to be visible
    await this.yesButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.yesButton.click();

    // Wait for confirmation
    await this.toastMessage.waitFor({ state: 'visible', timeout: 10000 });

    // Get and log toast message details
    const toastText = await this.toastMessageText.textContent();
    const toastDescription = await this.toastMessageDescription.textContent();
    console.log(`Toast Message: ${toastText}`);
    console.log(`Toast Description: ${toastDescription}`);

    return {
      message: toastText,
      description: toastDescription,
    };
  }
}
