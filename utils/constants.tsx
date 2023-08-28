import { HOTEL_CODE } from 'core/graphql/endpoints';
import { availablePaths } from './availablePaths';

export const Headers = ['Restaurants & Bars', 'Offers', 'In-Room Dining', 'Hotel'];
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
export const restaurantsBars = 'restaurants-bars';
export const offers = 'offers';
export const ALL_DAY = 'all day';
export const reservationFlow = 'Restaurant Booking Flow';
export const precheckinErrorMsg = 'Booking is already checked in with type:PreCheckIn';
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
export const driversLicence = 'DRL';
export const driverLicence = 'DL';
export const passport = 'PASSPORT';
export const CUSTOM = 'CUSTOM';
export const PAYMENT = [
  { id: '2', name: 'CASH', message: '' },
  { id: '3', name: 'CARD', message: '' },
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
export const home = 'Home';
export const radisson = 'radisson';
export const HOUSEKEEPING = 'Housekeeping';
export const DINING = 'Dining';
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

export const DUBAI_WATERFRONT = 'dubai-waterfront';

export const BARCELONA = 'barcelona';

export const servicesEvent = {
  action: 'Click',
  category: 'Services',
  label: 'Service Requests',
  value: 1,
};

export const fandbDiningEvent = {
  action: 'Click',
  category: 'F&B Dining',
  label: 'F&B Dining Order',
  value: 1,
};

export const irdEvent = {
  action: 'Click',
  category: 'In-Room Dining',
  label: 'In-Room Dining Order',
  value: 1,
};

export const STATUS = [
  { key: 'NEW_ORDER', value: 'New Order' },
  { key: 'PREPARING', value: 'Preparing' },
  { key: 'DELIVERED', value: 'Delivered' },
  { key: 'ACCEPTED', value: 'Accepted' },
];

export const Gender = [
  { name: 'Male', value: 'MALE' },
  { name: 'Female', value: 'FEMALE' },
];
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
export const checkIn = 'checkin';
export const review = 'review';
export const CANCELED = 'CANCELED';
export const CHECKEDOUT = 'CHECKEDOUT';
export const CHKOUT = 'CHKOUT';

export const serviceRequestIcons = [
  {
    name: 'Other Services',
    icon: '/icons/OtherServices.svg',
  },
  {
    name: 'Make up room',
    icon: '/icons/MakeUpRoom.svg',
  },
  {
    name: 'Laundry',
    icon: '/icons/Laundry.svg',
  },
  {
    name: 'Towels',
    icon: '/icons/Towels.svg',
  },
  {
    name: 'Bathroom Amenities',
    icon: '/icons/BathroomAmenities.svg',
  },
  {
    name: 'Room Amenities',
    icon: '/icons/RoomAmenities.svg',
  },
  {
    name: 'Kit',
    icon: '/icons/Kit.svg',
  },
  {
    name: 'Iron & Iron Board',
    icon: '/icons/IronBoard.svg',
  },
  {
    name: 'Tea / Coffee Amenities',
    icon: '/icons/TeaCoffeeAmenities.svg',
  },
  {
    name: 'Bed',
    icon: '/icons/MakeUpRoom.svg',
  },
  {
    name: 'Kid',
    icon: '/icons/Kid.svg',
  },
  {
    name: 'Blanket',
    icon: '/icons/Blanket.svg',
  },
  {
    name: 'Minibar',
    icon: '/icons/Minibar.svg',
  },
  {
    name: 'Pet',
    icon: '/icons/Pet.svg',
  },
  {
    name: 'Additional item Request',
    icon: '/icons/AdditionalRequest.svg',
  },
  {
    name: 'Room Assistance',
    icon: '/icons/RoomAssistance.svg',
  },
  {
    name: 'In Room Items - Shopping',
    icon: '/icons/InRoomItems.svg',
  },
];
