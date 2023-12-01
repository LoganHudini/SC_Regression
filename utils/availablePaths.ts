import { getHotelCode } from './fetchConfigs';

const hotel = getHotelCode();

export const availablePaths = {
  // Home
  HOME: `/${hotel}/`,

  // Preferences
  PREFERENCES: `/${hotel}/preferences`,

  // Check-in flow
  CHECK_IN: `/${hotel}/check-in`,
  GUEST_VERIFICATION: `/${hotel}/check-in/guest-verification`,
  CARD_AUTHORISATION: `/${hotel}/check-in/card-authorisation`,
  PAYMENT: `/${hotel}/check-in/payment`,
  PERSONALIZE: `/${hotel}/check-in/personalization`,
  REVIEW: `/${hotel}/check-in/review`,

  // Youverse
  YOUVERSE: `/${hotel}/youverse`,

  // Incode
  INCODE: `/${hotel}/incode`,

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
