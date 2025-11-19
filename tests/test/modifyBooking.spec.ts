import { test, expect } from '@playwright/test';
import { ModifyBookingPage } from '../page-objects/Pages/modifyBooking.page';

// E2E flow for modifying an existing booking from My Itinerary

test.describe('Modify Booking Flow', () => {
  let modifyBookingPage: ModifyBookingPage;

  test.beforeEach(async ({ page }) => {
    modifyBookingPage = new ModifyBookingPage(page);
  });

  test('should navigate, select an itinerary item and modify the booking', async ({ page }) => {
    // 1. Verify able to navigate to home page
    await test.step('Navigate to home page', async () => {
      await modifyBookingPage.open();
      await expect(page).toHaveURL(/fairmont-mumbai/);
    });

    // 2. Verify able to click Get Started and enter credentials
    await test.step('Click Get Started and enter credentials', async () => {
      await modifyBookingPage.clickGetStarted();
      // After credentials, we should no longer be on the initial screen
      await expect(page).not.toHaveURL(/get-started/i);
    });

    // 3. Verify able to navigate to My Itinerary
    await test.step('Navigate to My Itinerary page', async () => {
      await modifyBookingPage.navigateToMyItinerary();
      await expect(page).toHaveURL(/itinerary/);
    });

    // 4. Verify able to select an activity in My Itinerary
    await test.step('Select first activity in My Itinerary', async () => {
      await modifyBookingPage.selectActivityInMyItinerary();
      // We expect some kind of activity detail / modify button to be present
      await expect(page.getByRole('button', { name: 'Modify' })).toBeVisible();
    });

    // 5. Verify able to modify the booking
    await test.step('Modify booking and verify confirmation', async () => {
      const confirmation = await modifyBookingPage.modifyBooking();
      expect(confirmation.message).toBeTruthy();
      expect(confirmation.description).toBeTruthy();
    });
  });
});
