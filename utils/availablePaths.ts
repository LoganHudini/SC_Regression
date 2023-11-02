import { getHotelCode } from './fetchConfigs';

const hotel = getHotelCode();

export const availablePaths = {
  // Home
  HOME: `/${hotel}/`,

  // Preferences
  PREFERENCES: `/${hotel}/preferences`,

  // Check-in flow
  GUEST_INFORMATION_INPUT: `/${hotel}/check-in/information`,
  ACCOMPANY_GUEST: `/${hotel}/check-in/accompanyguest`,
  CHECK_IN_PAYMENT: `/${hotel}/check-in/payment`,
  PERSONALIZE_YOUR_ROOM: `/${hotel}/check-in/personalization`,
  CHECK_IN: `/${hotel}/check-in/review`,

  // Dining flow
  DINING: `/${hotel}/dining`,
  DINING_ORDER_SUMMARY: `/${hotel}/dining-order-summary`,

  // Retaurants flow
  RESTAURANTS_BARS: `/${hotel}/restaurants-bars`,

  // Spa flow
  SPA: `/${hotel}/spa`,

  // Housekeeping flow
  HOUSEKEEPING: `/${hotel}/housekeeping`,

  // Offers
  OFFERS: `/${hotel}/offers`,

  // Hotel-compendium
  HOTEL_COMPENDIUM: `/${hotel}/hotel-compendium`,

  // Checkout flow
  BILL: `/${hotel}/checkout`,

  // feedback
  FEEDBACK: `/${hotel}/feedback`,

  // Others
  PAGE_NOT_FOUND: '/404',
};
