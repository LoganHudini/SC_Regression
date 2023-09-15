import { availablePaths } from './availablePaths';

export const flowPathMap = {
  CHECKIN_FLOW: availablePaths?.CHECK_IN,
  IRD_BOOKING: availablePaths?.DINING,
  RESTAURANT_BOOKING: availablePaths?.RESTAURANTS_BARS,
  HOUSEKEEPING_BOOKING: availablePaths?.HOUSEKEEPING,
  WELLNESS_BOOKING: availablePaths?.SPA,
  HOTEL_COMPENDIUM_FLOW: availablePaths?.HOTEL_COMPENDIUM,
  OFFERS_FLOW: availablePaths?.OFFERS,
  VIEW_BILL_CHECKOUT_FLOW: availablePaths?.BILL,
  ROOM_BOOKING: null,
  FEEDBACK_FLOW: null,
  DIGITAL_KEY_FLOW: null,

  //offer
  SPA: availablePaths?.SPA,
  IRD: availablePaths?.DINING,
  RESTAURANT: availablePaths?.RESTAURANTS_BARS,
  LOGOUT_FLOW: null,
  LOGIN_FLOW: null,
};
