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
  UPGRADE_ROOM: `/${hotel}/check-in/upgrade-room`,
  GUEST_PREFERENCES: `/${hotel}/check-in/guestPreferences`,

  // Youverse
  YOUVERSE: `/${hotel}/youverse`,

  // trential
  TRENTIAL: `/${hotel}/trential`,

  // Incode
  INCODE: `/${hotel}/incode`,

  // Dining flow
  DINING: `/${hotel}/dining`,
  DINING_MENU: `/${hotel}/dining-menu`,
  DINING_ORDER_SUMMARY: `/${hotel}/dining-order-summary`,

  // Retaurants flow
  RESTAURANTS_BARS: `/${hotel}/restaurants-bars`,

  // Spa flow
  SPA: `/${hotel}/spa`,
  SPA_INFO: `/${hotel}/spa-info`,

  // Map
  MAP: `/${hotel}/maps`,

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

  // Activity And Itinerary
  ITINERARY: `/${hotel}/itinerary`,
  ACTIVITY: `/${hotel}/activity`,
  ACTIVITY_DETAILS: `/${hotel}/activityDetails`,
};
