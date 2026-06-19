import { Page, Locator, expect } from '@playwright/test';

export class ActivityDetailDrawerPage {
  private page: Page;
  private drawer: Locator;
  private participantIncrementButton: Locator;
  private participantDecrementButton: Locator;
  private participantCount: Locator;
  private datePicker: Locator;
  private durationminutes: Locator;
  private durationIncrementButton: Locator;
  private durationDecrementButton: Locator;
  private notesTextarea: Locator;
  private submitButton: Locator;
  private modalConfirmButton: Locator;
  private getStartedButton: Locator;
  public roomNo: Locator;
  private lastName: Locator;

  // Public method to access lastName field
  public async fillLastName(value: string): Promise<void> {
    await this.lastName.fill(value);
  }
  public nextButton: Locator;
  private myItineraryButton: Locator;
  private exploreActivitiesButton: Locator;
  private activityCategory: (categoryName: string) => Locator;
  private activityItem: (activityName: string) => Locator;
  private bookNowButton: Locator;
  private confirmBookingButton: Locator;
  private toastMessage: Locator;
  private toastMessageText: Locator;
  private toastMessageDescription: Locator;
  private activitiesContainer: Locator;
  private selectedActivityName: string | null = null;
  private selectedActivityTime: string | null = null;
  private activityHours: Locator;
  private activityMinutes: Locator;
  private activityAMPM: Locator;
  private firstSelectedActivity: string | null = null;

  constructor(page: Page) {
    this.page = page;
    this.getStartedButton = this.page.getByRole('button', { name: 'Get Started' });
    this.drawer = page.locator('[data-testid="activity-detail-drawer"]');
    this.participantIncrementButton = page.locator(
      '(//button[@class="PlusMinusInput_plusMinusButton__TG7kU"]//*[@class="PlusMinusInput_plusIcon__9fpP0"])[1]',
    );
    this.participantDecrementButton = page.locator(
      '(//button[@class="PlusMinusInput_plusMinusButton__TG7kU"]//*[@class="PlusMinusInput_minusIcon__iQEx_"])[1]',
    );
    this.participantCount = page.locator(
      '//p[text()="No. of people"]/parent::*//p[@class="PlusMinusInput_value__6qWPJ"]',
    );
    this.datePicker = page.locator(
      '//p[text()="Date"]/following-sibling::div[contains(@class,"rmc-multi-picker")]//div[contains(@class,"rmc-picker-item")]',
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
    this.notesTextarea = page.locator('//input[@placeholder="Add a note (optional)"]');
    this.submitButton = page.getByRole('button', { name: /submit/i });
    this.modalConfirmButton = page.getByRole('button', { name: /yes, cancel/i });
    this.roomNo = page.locator('input[name="roomNo"]');
    this.lastName = page.locator('input[name="lastName"]');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.myItineraryButton = page.getByRole('button', { name: 'my itinerary' });
    this.exploreActivitiesButton = page.locator('//button[text()="Explore Activities"]');
    this.activityCategory = (categoryName) =>
      page
        .locator('//p[@class="activity_name__Or0uD globals-activityTitle"]')
        .filter({ hasText: categoryName });
    this.activityItem = (activityName) =>
      page
        .locator('//h2[@class="ListComponents_listComponentTitle__IWRAf globals-text-align"]')
        .filter({ hasText: activityName });
    this.bookNowButton = page.getByRole('button', { name: /Book Now/i });
    this.confirmBookingButton = page.locator('//button[@id=":r1p:"]');
    this.toastMessage = page.locator('//div[@class="Notification_contentWrapper__trX5v"]');
    this.toastMessageText = page.locator('//p[@class="Notification_title__5bQnp"]');
    this.toastMessageDescription = page.locator('//p[@class="Notification_description__YSdhB"]');
    this.activitiesContainer = page.locator(
      '//span[@class="activityAndItinerary_cardTitle__Eaz_g"]',
    );

    // Time picker locators
    this.activityHours = page.locator(
      '(//p[text()="Start Time"]/following-sibling::div//div[@class="rmc-picker"])[1]//div[contains(@class, "rmc-picker-item-selected")]',
    );
    this.activityMinutes = page.locator(
      '(//p[text()="Start Time"]/following-sibling::div//div[@class="rmc-picker"])[2]//div[contains(@class, "rmc-picker-item-selected")]',
    );
    this.activityAMPM = page.locator(
      '(//p[text()="Start Time"]/following-sibling::div//div[@class="rmc-picker"])[3]//div[contains(@class, "rmc-picker-item-selected")]',
    );
  }

  // Navigation
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

  // Get all activity categories and click the first one
  async logAndClickFirstCategory() {
    const categories = this.page.locator(
      '//p[@class="activity_name__Or0uD globals-activityTitle"]',
    );
    const count = await categories.count();

    console.log('Found', count, 'categories:');
    for (let i = 0; i < count; i++) {
      const text = await categories.nth(i).textContent();
      console.log(`${i + 1}. ${text}`);
    }

    if (count > 0) {
      await categories.first().click();
      return await categories.first().textContent();
    }
    return null;
  }

  // Explore activities and select a category
  async exploreActivities() {
    await this.exploreActivitiesButton.click();
    await this.page.waitForTimeout(2000); // Wait for categories to load
  }

  // Select activity category
  async selectCategory(categoryName?: string) {
    // Get all category elements
    const categoryElements = this.page.locator(
      '//p[@class="activity_name__Or0uD globals-activityTitle"]',
    );
    await categoryElements.first().waitFor({ state: 'visible', timeout: 10000 });

    // Get all category names
    const count = await categoryElements.count();
    if (count === 0) {
      throw new Error('No categories found');
    }

    // Log all available categories
    console.log('\nAvailable categories:');
    const categories: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = ((await categoryElements.nth(i).textContent()) || `Category ${i + 1}`).trim();
      categories.push(text);
      console.log(`${i + 1}. ${text}`);
    }

    // Select the first category by default if none specified
    const selectedCategory = categoryName || categories[0];
    console.log(`\nSelected category: "${selectedCategory}"`);

    // Find and click the category
    const categoryToClick = categoryElements.filter({ hasText: selectedCategory }).first();
    await categoryToClick.scrollIntoViewIfNeeded();
    await categoryToClick.click();

    // Wait for activities to load
    const activitiesLocator = this.page.locator(
      '//h2[@class="ListComponents_listComponentTitle__IWRAf globals-text-align"]',
    );
    await activitiesLocator.first().waitFor({ state: 'visible', timeout: 15000 });

    // Log activities in the selected category
    const activities = await activitiesLocator.all();
    console.log(`\nFound ${activities.length} activities in "${selectedCategory}":`);
    for (let i = 0; i < activities.length; i++) {
      const activityText = ((await activities[i].textContent()) || `Activity ${i + 1}`).trim();
      console.log(`${i + 1}. ${activityText}`);
    }

    return selectedCategory;
  }

  // Select first activity in the currently selected category
  async selectFirstActivity() {
    const activities = this.page.locator(
      '//h2[@class="ListComponents_listComponentTitle__IWRAf globals-text-align"]',
    );
    const activityCount = await activities.count();

    if (activityCount === 0) {
      throw new Error('No activities found in this category');
    }

    console.log(`\nFound ${activityCount} activities:`);
    for (let i = 0; i < activityCount; i++) {
      const activityText = (await activities.nth(i).textContent()) || `Activity ${i + 1}`;
      console.log(`${i + 1}. ${activityText}`);
    }

    // Click the first activity
    const firstActivity = (await activities.first().textContent()) || 'First Activity';
    this.firstSelectedActivity = firstActivity;
    console.log(`\nSelecting first activity: ${firstActivity}`);
    await activities.first().click();
    await this.bookNowButton.waitFor({ state: 'visible' });

    return firstActivity;
  }

  // Select an activity
  async selectActivity(activityName?: string) {
    if (activityName) {
      await this.activityItem(activityName).first().click();
    } else {
      // If no activity name provided, click the first available activity
      const activities = this.page.locator(
        '//h2[@class="ListComponents_listComponentTitle__IWRAf globals-text-align"]',
      );
      const count = await activities.count();

      if (count === 0) {
        throw new Error('No activities found');
      }

      // Log all available activities
      console.log('\nFound', count, 'activities:');
      for (let i = 0; i < count; i++) {
        const text = await activities.nth(i).textContent();
        console.log(`${i + 1}. ${text}`);
      }

      // Click the first activity
      await activities.first().click();
    }

    await this.bookNowButton.waitFor({ state: 'visible' });
  }

  // Log all available activities and click the first one
  async logAndClickFirstActivity() {
    const activities = this.page.locator(
      '//h2[@class="ListComponents_listComponentTitle__IWRAf globals-text-align"]',
    );
    const count = await activities.count();

    if (count === 0) {
      throw new Error('No activities found');
    }

    console.log('\nFound', count, 'activities:');
    for (let i = 0; i < count; i++) {
      const text = await activities.nth(i).textContent();
      console.log(`${i + 1}. ${text}`);
    }

    // Store the selected activity name in the class property
    this.selectedActivityName = await activities.first().textContent();
    console.log(`\nSelecting first activity: ${this.selectedActivityName}`);
    await activities.first().click();
    await this.bookNowButton.waitFor({ state: 'visible' });

    return this.selectedActivityName;
  }

  // Book the activity
  async bookActivity(activityDetails: {
    participants: number;
    date?: string;
    time?: string;
    duration: string;
    notes?: string;
  }) {
    // Click Book Now
    await this.bookNowButton.click();

    // Wait for the time picker to be visible
    await this.page.waitForSelector(
      '(//p[text()="Start Time"]/following-sibling::div//div[@class="rmc-picker"])[1]//div[contains(@class, "rmc-picker-item-selected")]',
    );

    // Get and store the selected time from the picker
    const currentTime = await this.getCurrentTimeFromPicker();
    this.selectedActivityTime = currentTime;
    console.log(`Selected time from picker: ${currentTime}`);

    // Set number of participants
    const currentCount = await this.getParticipantCount();
    const difference = activityDetails.participants - currentCount;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        await this.participantIncrementButton.click();
      }
    } else if (difference < 0) {
      for (let i = 0; i < Math.abs(difference); i++) {
        await this.participantDecrementButton.click();
      }
    }

    // Get current date and calculate next day
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 1);

    // Format for comparison
    // const targetMonth = targetDate.toLocaleString('default', { month: 'short' });
    // const targetDay = targetDate.getDate();

    // Get the date picker container
    const datePickerContainer = this.page.locator(
      '//p[text()="Date"]/following-sibling::div[contains(@class,"rmc-multi-picker")]',
    );
    const dateItems = datePickerContainer.locator('div.rmc-picker-item');

    // Wait for date items to be visible
    await dateItems.first().waitFor({ state: 'visible' });

    // Get the first date item's text to understand the format
    const firstDateText = await dateItems.first().textContent();
    console.log('First available date:', firstDateText);

    // Since the target date should be the first selectable date (next day),
    // we can directly select the first available date
    await dateItems.first().scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Small delay for scroll to complete

    // The date should now be in selected state since it's the first one
    console.log('Selected the first available date');

    // Set duration if provided
    if (activityDetails.duration) {
      let targetDuration = parseInt(activityDetails.duration, 10);

      // Round to nearest 15 minutes
      targetDuration = Math.round(targetDuration / 15) * 15;

      // Ensure minimum duration of 15 minutes
      targetDuration = Math.max(15, targetDuration);

      const currentDuration = await this.getDuration();
      const difference = (targetDuration - currentDuration) / 15; // Calculate number of steps

      if (difference > 0) {
        // Need to increment
        for (let i = 0; i < difference; i++) {
          await this.durationIncrementButton.click();
          await this.page.waitForTimeout(100);
        }
      } else if (difference < 0) {
        // Need to decrement
        for (let i = 0; i < Math.abs(difference); i++) {
          await this.durationDecrementButton.click();
          await this.page.waitForTimeout(100);
        }
      }
      console.log(`Set duration to ${targetDuration} minutes`);
    }

    // Add notes - use provided notes or default test note
    const testNote = 'QA test note - ' + new Date().toISOString();
    const notesToAdd = activityDetails.notes || testNote;
    await this.notesTextarea.fill(notesToAdd);
    console.log(`Added note: ${notesToAdd}`);

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

  // Set the activity time
  async setActivityTime(time: string) {
    this.selectedActivityTime = time;
    console.log(`Activity time set to: ${this.selectedActivityTime}`);
  }

  // Get the current selected time from time picker
  private async getCurrentTimeFromPicker(): Promise<string> {
    let hour = await this.activityHours.textContent();
    const minute = await this.activityMinutes.textContent();
    let period = await this.activityAMPM.textContent();

    if (!hour || !minute || !period) {
      throw new Error('Could not read time from time picker');
    }

    // Remove leading zero from hour if present (e.g., '02' -> '2')
    hour = hour.startsWith('0') ? hour.substring(1) : hour;
    // Convert period to lowercase (e.g., 'PM' -> 'pm')
    period = period.toLowerCase();

    return `${hour}:${minute} ${period}`.trim();
  }

  getSelectedActivityName(): string | null {
    return this.selectedActivityName;
  }

  getSelectedActivityTime(): string | null {
    return this.selectedActivityTime;
  }

  async takeScreenshot(fileName: string): Promise<void> {
    await this.page.screenshot({ path: fileName, fullPage: true });
  }

  // Verify the activity in the itinerary
  async verifyBookedActivityInItinerary(): Promise<boolean> {
    try {
      await this.page.waitForURL(
        'https://fairmont.hudinielevate-stage.io/en/fairmont-mumbai/itinerary/',
        { timeout: 30000 },
      );
      console.log('Successfully navigated to Fairmont Mumbai Itinerary page');
    } catch (error) {
      console.error('Failed to navigate to Itinerary page. Current URL:', this.page.url());
      await this.page.screenshot({ path: 'itinerary-navigation-failed.png', fullPage: true });
      return false;
    }

    // Additional wait for the page to stabilize
    // await this.page.waitForTimeout(15000);

    // Wait for My Itinerary header to be visible
    const myItineraryHeader = this.page.locator('//p[text()="My Itinerary"]');
    try {
      await myItineraryHeader.waitFor({ state: 'visible', timeout: 15000 });
      console.log('My Itinerary header is visible');

      // Get the selected time that was stored during booking
      const selectedTime = this.getSelectedActivityTime();
      if (!selectedTime) {
        console.error('No selected time found');
        return false;
      }

      console.log(`Using selected time for verification: "${selectedTime}"`);

      const activityLocator = this.page.locator(
        `//span[contains(text(),"${selectedTime}")]/parent::div/following-sibling::div//div//span[@class="activityAndItinerary_cardTitle__Eaz_g"]`,
      );

      console.log('Waiting for activity to be visible...');
      try {
        await activityLocator.waitFor({ state: 'visible', timeout: 15000 });
        console.log('Activity is now visible');

        // Get the activity details
        const bookedActivityName = await activityLocator.textContent();
        console.log(`Booked activity name: ${bookedActivityName}`);
        console.log(`Selected activity name: ${this.firstSelectedActivity}`);

        if (!bookedActivityName || !this.firstSelectedActivity) {
          console.error('Activity name or firstSelectedActivity is missing');
          return false;
        }

        // Assertion: both names must match
        await expect(bookedActivityName).toBe(this.firstSelectedActivity);

        console.log('Activity name matches');
        return true;
      } catch (error) {
        console.error('Failed to verify activity in itinerary. Current URL:', this.page.url());
        await this.page.screenshot({ path: 'activity-verification-failed.png', fullPage: true });
        return false;
      }
    } catch (error) {
      console.error('Failed while waiting for My Itinerary header. Current URL:', this.page.url());
      await this.page.screenshot({ path: 'my-itinerary-header-failed.png', fullPage: true });
      return false;
    }
  }
}
