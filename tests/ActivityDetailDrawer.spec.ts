import { test, expect } from '@playwright/test';
import { ActivityDetailDrawerPage } from './page-objects/Pages/ActivityDetailDrawerPage';

test.describe('Activity Booking Flow', () => {
  let activityPage: ActivityDetailDrawerPage;
  const testBookingDetails = {
    roomNumber: '1602',
    lastName: 'M',
    participants: 2,
    duration: '1 hour',
    notes: 'Test booking from automated test',
    // date and time can be set dynamically if needed
  };

  test.beforeEach(async ({ page }) => {
    activityPage = new ActivityDetailDrawerPage(page);
  });

  test('should complete full activity booking flow', async ({ page }) => {
    test.setTimeout(60000);
    // 1. Navigate to home screen and open the app
    await test.step('Open application and handle initial flow', async () => {
      // This will handle the initial navigation and clicking 'Get Started'
      await activityPage.open();
    });

    // 2. Click Get Started and enter booking details
    await test.step('Complete initial booking form', async () => {
      await activityPage.clickGetStarted();
    });

    // 3. Navigate to My Itinerary
    await test.step('Navigate to My Itinerary', async () => {
      await activityPage.navigateToMyItinerary();
      // Verify we're on the itinerary page
      await expect(page.getByText('My Itinerary')).toBeVisible();
    });

    // 4. Click Explore Activities
    await test.step('Explore Activities', async () => {
      await activityPage.exploreActivities();
      // Verify we're on the activities page
      await expect(page.getByText('Activities')).toBeVisible();
    });

    // 5. Select a category
    await test.step('Select activity category', async () => {
      await activityPage.selectCategory();
      // Verify activities for the category are shown using the same locator as in the page object
      const activitiesLocator = page.locator(
        '//h2[@class="ListComponents_listComponentTitle__IWRAf globals-text-align"]',
      );
      await expect(activitiesLocator).not.toHaveCount(0);

      // Log the number of activities found for debugging
      const count = await activitiesLocator.count();
      console.log(`Found ${count} activities after selecting category`);
    });

    // 6. Select the first activity
    let selectedActivity: string | null = null;
    await test.step('Select first activity', async () => {
      selectedActivity = await activityPage.selectFirstActivity();
      expect(selectedActivity).toBeTruthy();
      // Verify activity details are shown
      await expect(page.getByRole('button', { name: 'Book Now' })).toBeVisible();
    });

    // 7. Book the activity
    await test.step('Book the activity', async () => {
      const confirmation = await activityPage.bookActivity({
        participants: testBookingDetails.participants,
        duration: testBookingDetails.duration,
        notes: testBookingDetails.notes,
      });

      // 8. Verify toast message
      await test.step('Verify booking confirmation', async () => {
        expect(confirmation.message).toContain('Thank You!');
        expect(confirmation.description).toContain('Your booking has been confirmed');
      });
    });

    // Wait for toast message to appear
    await page.waitForSelector('//div[contains(@class, "Notification_contentWrapper")]', {
      timeout: 10000,
    });
    console.log('Toast message appeared');

    // Wait for navigation to complete after toast
    await page.waitForURL('https://fairmont.hudinielevate-stage.io/en/fairmont-mumbai/itinerary/', {
      timeout: 30000,
    });
    console.log('Navigated to Itinerary page');

    // Verify the booking in My Itinerary
    await test.step('Verify booking in My Itinerary', async () => {
      const isBooked = await activityPage.verifyBookedActivityInItinerary();
      if (!isBooked) {
        await activityPage.takeScreenshot('booking-verification-failed.png');
        throw new Error('Failed to verify booking in My Itinerary');
      }
    });
  });
});
