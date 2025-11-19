import { test, expect } from '@playwright/test';
import { CancelBookingPage } from '../page-objects/Pages/cancelBooking.page';

// E2E flow for cancelling an existing booking from My Itinerary

test.describe('Cancel Booking Flow', () => {
  let cancelBookingPage: CancelBookingPage;

  test.beforeEach(async ({ page }) => {
    cancelBookingPage = new CancelBookingPage(page);
  });

  test('should navigate, select an itinerary item and cancel the booking', async ({ page }) => {
    // 1. Verify able to navigate to home page
    await test.step('Navigate to home page', async () => {
      await cancelBookingPage.open();
      await expect(page).toHaveURL(/fairmont-mumbai/);
    });

    // 2. Verify able to click Get Started and enter credentials
    await test.step('Click Get Started and enter credentials', async () => {
      await cancelBookingPage.clickGetStarted();
      // After credentials, we should no longer be on the initial screen
      await expect(page).not.toHaveURL(/get-started/i);
    });

    // 3. Verify able to navigate to My Itinerary
    await test.step('Navigate to My Itinerary page', async () => {
      await cancelBookingPage.navigateToMyItinerary();
      await expect(page).toHaveURL(/itinerary/);
    });

    // 4. Verify able to select an activity in My Itinerary
    await test.step('Select first activity in My Itinerary', async () => {
      await cancelBookingPage.selectActivityInMyItinerary();
      // We expect some kind of activity detail / cancel button to be present
      await expect(page.getByRole('button', { name: 'CANCEL' })).toBeVisible();
    });

    // 5. Verify able to cancel the booking
    await test.step('Cancel booking and verify confirmation', async () => {
      const confirmation = await cancelBookingPage.cancelBooking();
      expect(confirmation.message).toBeTruthy();
      expect(confirmation.description).toBeTruthy();
    });
  });
});
