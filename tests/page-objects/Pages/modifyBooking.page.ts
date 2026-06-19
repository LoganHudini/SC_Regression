import { Page, Locator } from '@playwright/test';

export class ModifyBookingPage {
  private page: Page;
  private getStartedButton: Locator;
  public roomNo: Locator;
  private lastName: Locator;
  public nextButton: Locator;
  private myItineraryButton: Locator;
  private activitiesInMyItinerary: Locator;
  private modifyButton: Locator;
  private participantIncrementButton: Locator;
  private participantDecrementButton: Locator;
  private participantCount: Locator;
  private durationminutes: Locator;
  private durationIncrementButton: Locator;
  private durationDecrementButton: Locator;
  private confirmBookingButton: Locator;
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
    this.modifyButton = page.getByRole('button', { name: 'Modify' });
    this.participantIncrementButton = page.locator(
      '(//button[@class="PlusMinusInput_plusMinusButton__TG7kU"]//*[@class="PlusMinusInput_plusIcon__9fpP0"])[1]',
    );
    this.participantDecrementButton = page.locator(
      '(//button[@class="PlusMinusInput_plusMinusButton__TG7kU"]//*[@class="PlusMinusInput_minusIcon__iQEx_"])[1]',
    );
    this.participantCount = page.locator(
      '//p[text()="No. of people"]/parent::*//p[@class="PlusMinusInput_value__6qWPJ"]',
    );
    this.durationminutes = page.locator(
      '//p[text()="Duration"]/parent::*//p[@class="PlusMinusInput_value__6qWPJ"]',
    );
    this.durationIncrementButton = page.locator(
      '(//button[@class="PlusMinusInput_plusMinusButton__TG7kU"]//*[@class="PlusMinusInput_plusIcon__9fpP0"])[2]',
    );
    this.durationDecrementButton = page.locator(
      '(//button[@class="PlusMinusInput_plusMinusButton__TG7kU"]//*[@class="PlusMinusInput_minusIcon__iQEx_"])[2]',
    );
    this.confirmBookingButton = page.getByRole('button', { name: 'Confirm Booking' });
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
    await this.roomNo.fill('1603');
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

  async modifyBooking() {
    await this.modifyButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.modifyButton.click();

    // Increase number of participants (e.g., by 1)
    await this.participantIncrementButton.click();

    // Increase duration (e.g., by one step)
    await this.durationIncrementButton.click();

    // Submit booking
    console.log('Waiting for confirm booking button to be visible');
    const confirmButton = this.page.locator('//button[contains(text(),"Confirm Booking")]');
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click({ force: true }); // Add force:true to bypass actionability checks if needed

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

  // Helper methods
  private async getParticipantCount(): Promise<number> {
    const countText = await this.participantCount.textContent();
    return countText ? parseInt(countText, 10) : 0;
  }

  private async getDuration(): Promise<number> {
    const durationText = await this.durationminutes.textContent();
    return durationText ? parseInt(durationText, 10) : 30; // Default to 30 if not found
  }
}
