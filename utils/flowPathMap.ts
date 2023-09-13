import { availablePaths } from './availablePaths';

export const flowPathMap = {
  WELLNESS_BOOKING: availablePaths?.SPA,
  HOUSEKEEPING_BOOKING: availablePaths?.HOUSEKEEPING,
  RESTAURANT_BOOKING: availablePaths?.RESTAURANTS_BARS,
  LOGOUT_FLOW: null,
  LOGIN_FLOW: null,
  VIEW_BILL_CHECKOUT_FLOW: availablePaths?.BILL,
  ROOM_BOOKING: null,
  FEEDBACK_FLOW: null,
  IRD_BOOKING: availablePaths?.DINING,
  DIGITAL_KEY_FLOW: null,
  CHECKIN_FLOW: availablePaths?.CHECK_IN,
};
