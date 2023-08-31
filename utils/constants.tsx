import { HOTEL_CODE } from "core/graphql/endpoints";

export const CHECK_IN_FLOW_VERSION = process.env.NEXT_PUBLIC_CHECK_IN_FLOW_VERSION;
export const CHECK_OUT_FLOW_VERSION = process.env.NEXT_PUBLIC_CHECK_OUT_FLOW_VERSION;
export const DINING_FLOW_VERSION = process.env.NEXT_PUBLIC_DINING_FLOW_VERSION;
export const TABLE_RESERVATION_FLOW_VERSION =
  process.env.NEXT_PUBLIC_TABLE_RESERVATION_FLOW_VERSION;
export const HOUSEKEEPING_FLOW_VERSION = process.env.NEXT_PUBLIC_HOUSEKEEPING_FLOW_VERSION;
export const ROOM_CONTROLS_FLOW_VERSION = process.env.NEXT_PUBLIC_ROOM_CONTROLS_FLOW_VERSION;

// key constants
export const HOME = 'Home';
export const OFFERS = 'offers';
export const DRIVERS_LICENCE = 'DRL';
export const PASSPORT = 'PASSPORT';
export const CUSTOM = 'CUSTOM';
export const BARCELONA = 'barcelona';
export const HEADERS = ['Restaurants & Bars', 'Offers', 'In-Room Dining', 'Hotel'];
export const ALL_DAY = 'all day';
export const RESTAURANT_BOOKIN_FLOW = 'Restaurant Booking Flow';
export const PRE_CHECKIN_ERROR_MSG = 'Booking is already checked in with type:PreCheckIn';

// flow constants
export const DINING_OPTIONS = [
  {
    id: 'ird',
    title: 'In-Room Dining',
    path: '/dining',
  },
  {
    id: 'restaurants',
    title: 'Restaurants',
    path: '/restaurants-bars',
  },
  {
    id: 'bars',
    title: 'Bars',
    path: '/restaurants-bars',
  },
];
export const SERVICE_REQUEST_OPTIONS = [
  {
    id: 'services',
    title: 'Services',
    label: 'houseKeeping',
  },
  {
    id: 'concierge',
    title: 'Concierge',
    label: 'concierge',
  },
];
export const Schedules = ['TODAY', 'TOMORROW'];

export const cardTypes = [
  {
    id: '1',
    code: 'AX',
    name: 'American Express',
  },
  {
    id: '2',
    code: 'V',
    name: 'Visa',
  },
  {
    id: '3',
    code: 'MC',
    name: 'Master Card',
  },
  {
    id: '4',
    code: 'NS',
    name: 'Diners Club / Discover',
  },
  {
    id: '5',
    code: 'JC',
    name: 'JCB',
  },
];
const restaurantPath = '/restaurants-bars';
const offersPath = '/offers';
export const templateItems = [
  {
    title: 'RESTAURANT & BARS',
    path: restaurantPath,
    image: `/images/${HOTEL_CODE}/restaurant.png`,
  },
  {
    title: 'OFFERS',
    path: offersPath,
    image: `/images/${HOTEL_CODE}/offers.png`,
  },
  {
    title: 'RESTAURANT & BARS',
    path: restaurantPath,
    image: `/images/${HOTEL_CODE}/restaurant.png`,
  },
  {
    title: 'OFFERS',
    path: offersPath,
    image: `/images/${HOTEL_CODE}/offers.png`,
  },
];
export const DriversLicence = 'DRL';
export const DriverLicence = 'DL';
export const Passport = 'PASSPORT';
export const Email = 'email';
export const PhoneNumber = 'phoneNumber';
export const Phone = 'phone';
export const Checkin = 'checkin';
export const Cybersource = 'cybersource';
export const SelectDropdown = 'Select';
export const GuestInformation = 'Guest Information';
export const CreditCardInfo = 'Credit Card Info';
export const IdentityVerification = 'Identity Verification';
export const Information = 'information';
export const CreditCard = 'creditCard';
export const Guesticon = 'guestIcon';
export const Guest = 'guest';
export const UserGroup = 'userGroup';
export const IdCard = 'idCard';
export const AccompanyingGuest = 'accompanyingGuest';
export const CheckBox = 'CheckBox';

export const PAYMENT = [
  { id: '2', name: 'CASH', message: '' },
  { id: '3', name: 'CARD', message: '' },]

export const LANGUAGE_LIST_DUBAI = [
  { title: 'English', value: 'en' },
  { title: 'عربي', value: 'ar' },
];

export const LANGUAGE_LIST_BARCELONA = [
  { title: 'English', value: 'en' },
  { title: 'Español', value: 'es' },
  { title: 'Català', value: 'ct' },
  { title: 'Français', value: 'fr' },
];

export const PAYMENTFANDB = [
  { id: '1', name: 'BILL TO ROOM', message: '' },
  { id: '2', name: 'CASH', message: '' },
  { id: '3', name: 'CARD', message: '' },
];

export const TIPS = [
  { id: '1', value: 10 },
  { id: '2', value: 20 },
  { id: '3', value: 30 },
  { id: '4', value: 40 },
  { id: '5', value: 50 },
  { id: '6', value: 60 },
];

export const STATUS = [
  { key: 'NEW_ORDER', value: 'New Order' },
  { key: 'PREPARING', value: 'Preparing' },
  { key: 'DELIVERED', value: 'Delivered' },
  { key: 'ACCEPTED', value: 'Accepted' },
];

// path constants
export const HOUSEKEEPING = 'HOUSEKEEPING';
export const DINING = 'DINING';
export const RESTAURANTS_BARS = 'RESTAURANTS_BARS';
export const Gender = [
  { name: 'Male', value: 'MALE' },
  { name: 'Female', value: 'FEMALE' },
];
export const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PhoneRegex =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
export const checkIn = 'checkin';
export const review = 'review';
export const CANCELED = 'CANCELED';
export const CHECKEDOUT = 'CHECKEDOUT';
export const CHKOUT = 'CHKOUT';
export const personalisation = 'personalisation';
export const PERSONALISATION = 'PERSONALISATION';
