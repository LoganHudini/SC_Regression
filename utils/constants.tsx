export const CHECK_IN_FLOW_VERSION = process.env.NEXT_PUBLIC_CHECK_IN_FLOW_VERSION;
export const CHECK_OUT_FLOW_VERSION = process.env.NEXT_PUBLIC_CHECK_OUT_FLOW_VERSION;
export const DINING_FLOW_VERSION = process.env.NEXT_PUBLIC_DINING_FLOW_VERSION;
export const TABLE_RESERVATION_FLOW_VERSION =
  process.env.NEXT_PUBLIC_TABLE_RESERVATION_FLOW_VERSION;
export const HOUSEKEEPING_FLOW_VERSION = process.env.NEXT_PUBLIC_HOUSEKEEPING_FLOW_VERSION;
export const ROOM_CONTROLS_FLOW_VERSION = process.env.NEXT_PUBLIC_ROOM_CONTROLS_FLOW_VERSION;

// hotel constants
export const SOFITEL_MANILA = 'sofitel-manila';

// configuration constants
export const HOME = 'Home';
export const LOADER = 'loader';

// payment type constants
export const SHIFT4 = 'SHIFT4';
export const CYBERSOURCE = 'CYBERSOURCE';

// key constants
export const HouseKeeping = 'HouseKeeping';
export const OFFERS = 'offers';
export const DRIVERS_LICENCE = 'DRL';
export const PASSPORT = 'PASSPORT';
export const CUSTOM = 'CUSTOM';
export const TODAY = 'TODAY';
export const TOMORROW = 'TOMORROW';
export const IMMEDIATE = 'IMMEDIATE';
export const QUANTITY = 'Quantity';
export const DATE = 'Date ';
export const DAY = 'day';
export const DATETIME = 'Date & Time';
export const TIME = 'Time';
export const BARCELONA = 'barcelona';
export const HEADERS = ['Restaurants & Bars', 'Offers', 'In-Room Dining', 'Hotel'];
export const ALL_DAY = 'all day';
export const RESTAURANT_BOOKIN_FLOW = 'Restaurant Booking Flow';
export const PRE_CHECKIN_ERROR_MSG = 'Booking is already checked in with type:PreCheckIn';
export const CHECK_IN = 'Check-In';
export const REVIEW = 'review';
export const CANCELED = 'CANCELED';
export const CHECKEDOUT = 'CHECKEDOUT';
export const CHKOUT = 'CHKOUT';
export const personalisation = 'personalisation';
export const PERSONALISATION = 'PERSONALISATION';
export const BANNER_CAROUSEL = 'bannerCarousel';
export const DRIVERSLICENCE = 'DRL';
export const DRIVERLICENCE = 'DL';
export const EMAIL = 'email';
export const EMAILS = 'emails';
export const PHONENUMBER = 'phoneNumber';
export const PHONE = 'phone';
export const SELECTDROPDOWN = 'Select';
export const GUESTINFORMATION = 'Guest Information';
export const CREDITCARDINFO = 'Credit Card Info';
export const IDENTITYVERIFICATION = 'Identity Verification';
export const INFORMATION = 'information';
export const CREDITCARD = 'creditCard';
export const GUESTICON = 'guestIcon';
export const GUEST = 'guest';
export const USERGROUP = 'userGroup';
export const IDCARD = 'idCard';
export const ACCOMPANYINGGUEST = 'accompanyingGuest';
export const CHECKBOX = 'CheckBox';
export const IN_ROOM_DINING = 'In-Room Dining';
export const RESTAURANTS = 'restaurants';
export const BARS = 'Bars';
export const EXTERNALURL = 'External URL';
export const S3 = 'S3';
export const WEBURL = 'WEB_URL}';
export const IRD = 'ird';
export const ACTIVE = 'Active';
export const OK = 'OK';
export const ENQUIRE = 'ENQUIRE';
export const PHONECAPS = 'PHONE';
export const EMAILCAPS = 'EMAIL';
export const URL = 'URL';
export const ABOUT_US = 'About Us';
export const EXTERNAL = 'EXTERNAL';
export const IN_APP = 'IN_APP';
export const FLOW = 'FLOW';
export const YESNO = 'Yes / No';
export const PREFERENCES = 'Preferences';
export const HEADERSCONFIG = 'Headers';
export const OFFERSDURATION = 'OffersDuration';
export const RATING5STARS = 'Rating (5 Stars)';
export const EVERYDAY = 'EVERYDAY';
export const CHECKOUT = 'Check-out';
export const CHECKIN = 'Check-in';
export const TIMINGS = 'timings';

// flow constants
export const DAYS = [
  { id: 1, ischecked: false, name: 'Monday', from: null, to: null },
  { id: 2, ischecked: false, name: 'Tuesday', from: null, to: null },
  { id: 3, ischecked: false, name: 'Wednesday', from: null, to: null },
  { id: 4, ischecked: false, name: 'Thursday', from: null, to: null },
  { id: 5, ischecked: false, name: 'Friday', from: null, to: null },
  { id: 6, ischecked: false, name: 'Saturday', from: null, to: null },
  { id: 7, ischecked: false, name: 'Sunday', from: null, to: null },
];

export const DINING_OPTIONS_PRE_CHECK_IN = [
  {
    id: 'restaurant',
    title: 'Restaurants',
    path: '/restaurants-bars',
    width: '101.36px',
  },
  {
    id: 'bar',
    title: 'Bars',
    path: '/restaurants-bars',
    width: '47.77px',
  },
];

export const DINING_OPTIONS = [
  {
    id: 'ird',
    title: 'In-Room Dining',
    path: '/dining',
    width: '116.89px',
  },
  {
    id: 'restaurant',
    title: 'Restaurants',
    path: '/restaurants-bars',
    width: '101.36px',
  },
  {
    id: 'bar',
    title: 'Bars',
    path: '/restaurants-bars',
    width: '47.77px',
  },
];

export const SERVICE_REQUEST_OPTIONS = [
  {
    id: 'services',
    title: 'Housekeeping',
    carouselLabel: 'HouseKeeping',
    label: 'houseKeeping',
  },
  {
    id: 'concierge',
    title: 'Concierge',
    carouselLabel: 'Concierge',
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
  {
    id: '6',
    code: 'VS',
    name: 'Visa',
  },
  {
    id: '7',
    code: 'VA',
    name: 'Visa',
  },
];

export const PAYMENT = [
  { id: '1', name: 'BILL TO ROOM', message: '' },
  { id: '2', name: 'CASH', message: '' },
  { id: '3', name: 'CARD', message: '' },
];

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

export const TimeFormatArray = ['AM', 'PM'];

export const Gender = [
  { name: 'Male', value: 'MALE' },
  { name: 'Female', value: 'FEMALE' },
];

export const CAROUSEL_RESPONSIVE = {
  desktop: {
    breakpoint: { max: 100000, min: 701 },
    items: 2.5,
  },
  tablet: {
    breakpoint: { max: 700, min: 551 },
    items: 2,
  },
  mobileLarge: {
    breakpoint: { max: 550, min: 491 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 490, min: 361 },
    items: 1,
  },
  mobileSmall: {
    breakpoint: { max: 360, min: 0 },
    items: 1,
  },
};

// path constants
export const HOUSEKEEPING = 'HOUSEKEEPING';
export const DINING = 'DINING';
export const RESTAURANTS_BARS = 'RESTAURANTS_BARS';

// regex constants
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
