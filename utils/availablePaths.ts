import {
  CHECK_IN_FLOW_VERSION,
  CHECK_OUT_FLOW_VERSION,
  DINING_FLOW_VERSION,
  HOUSEKEEPING_FLOW_VERSION,
  ROOM_CONTROLS_FLOW_VERSION,
  TABLE_RESERVATION_FLOW_VERSION,
} from './constants';

export const availablePaths = {
  INDEX: '/',

  // Incode Check-in
  INCODE: '/incode',

  // Check-in flow
  GET_RESERVATION: '/check-in',
  ABOUT_YOUR_STAY: `/check-in.${CHECK_IN_FLOW_VERSION}/about-your-stay`,
  CHECK_IN_PAYMENT: `/check-in.${CHECK_IN_FLOW_VERSION}/check-in-payment`,
  CHECK_IN: `/check-in.${CHECK_IN_FLOW_VERSION}/check-in`,
  GUEST_INFORMATION_INPUT: `/check-in.${CHECK_IN_FLOW_VERSION}/guest-information-input`,
  GUEST_INFORMATION: `/check-in.${CHECK_IN_FLOW_VERSION}/guest-information`,
  PERSONALIZE_YOUR_ROOM: `/check-in.${CHECK_IN_FLOW_VERSION}/personalize-your-room`,
  PRE_CHECK_IN_CONFIRMATION: `/check-in.${CHECK_IN_FLOW_VERSION}/pre-check-in-confirmation`,
  CHECK_IN_CONFIRMATION: `/check-in.${CHECK_IN_FLOW_VERSION}/check-in-confirmation`,
  RESERVAION_CONFIRMATION: `/check-in.${CHECK_IN_FLOW_VERSION}/reservation-confirmation`,
  ROOM_ASSIGNED: `/check-in.${CHECK_IN_FLOW_VERSION}/room-assigned`,
  ROOM_DETAILS: `/check-in.${CHECK_IN_FLOW_VERSION}/room-details`,
  SELECT_ROOM: `/check-in.${CHECK_IN_FLOW_VERSION}/select-room`,
  UPGRADES: `/check-in.${CHECK_IN_FLOW_VERSION}/upgrades`,

  // Checkout flow
  BILL: '/checkout',
  CHECKOUT_CONFIRMATION: `/checkout.${CHECK_OUT_FLOW_VERSION}/checkout-confirmation`,
  CHECKOUT_PAYMENT: `/checkout.${CHECK_OUT_FLOW_VERSION}/checkout-payment`,

  // Dining flow
  DINING: '/dining',
  DINING_DETAILS: `/dining.${DINING_FLOW_VERSION}/dining-detail`,
  DINING_MENU: `/dining.${DINING_FLOW_VERSION}/dining-menu`,
  DINING_ORDER_SUMMARY: `/dining.${DINING_FLOW_VERSION}/dining-order-summary`,
  DINING_RESERVATION_CONFIRMATION: `/dining.${DINING_FLOW_VERSION}/dining-reservation-confirmation`,
  RESTAURANTS_BARS: '/restaurants-bars',

  // Housekeeping flow
  HOUSEKEEPING: '/housekeeping',
  HOUSEKEEPING_CHECKBOX: `/housekeeping.${HOUSEKEEPING_FLOW_VERSION}/housekeeping-checkbox`,
  HOUSEKEEPING_QUANTITY: `/housekeeping.${HOUSEKEEPING_FLOW_VERSION}/housekeeping-quantity`,
  HOUSEKEEPING_RESERVATION_CONFIRMATION: `/housekeeping.${HOUSEKEEPING_FLOW_VERSION}/housekeeping-reservation-confirmation`,

  // Room controls flow
  ROOM_CONTROLS_TV_CHANNEL: `/room-controls.${ROOM_CONTROLS_FLOW_VERSION}/room-controls-tv-channel`,
  ROOM_CONTROLS_TV_LIST: `/room-controls.${ROOM_CONTROLS_FLOW_VERSION}/room-controls-tv-list`,
  ROOM_CONTROLS: '/room-controls',
  ROOM_CONTROLS_TV: '/room-controls?selectedEntity=TV',

  TRIPS: '/trips',
  LANGUAGE: '/language',
  CHAT: '/chat',

  // Table reservations
  TABLE_RESERVATION: '/table-reservation',
  TABLE_RESERVATION_TIME: `/table-reservation.${TABLE_RESERVATION_FLOW_VERSION}/table-reservation-time`,
  TABLE_RESERVATION_DETAILS: `/table-reservation.${TABLE_RESERVATION_FLOW_VERSION}/table-reservation-details`,
  TABLE_RESERVATION_CONFIRMATION: `/table-reservation.${TABLE_RESERVATION_FLOW_VERSION}/table-reservation-confirmation`,

  // notifications
  NOTIFICATIONS: '/notifications',
  OFFERS: '/offers',
};
