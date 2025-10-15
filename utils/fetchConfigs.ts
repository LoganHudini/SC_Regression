import { configurationVar } from 'utils/configService';

const queryString: any = typeof window !== 'undefined' && window?.location?.pathname;
const configuration = () => configurationVar();

export const getHotelCode = () =>
  (queryString !== false && queryString?.split('/')[2]) ??
  (typeof window !== 'undefined' &&
    localStorage.getItem('hotel') &&
    JSON.parse(localStorage.getItem('hotel') ?? ''));

export const getHotelId = () => {
  return configuration()?.find((c: any) => c?.code === getHotelCode())?.hotelId;
};

export const getFetchFromDb = () => {
  return configuration()?.find((c: any) => c?.code === getHotelCode())?.fetchFromDb;
};

export const getSaveToDb = () => {
  return configuration()?.find((c: any) => c?.code === getHotelCode())?.saveToDb;
};

export const getHotelName = () => {
  return configuration()?.find((c: any) => c?.code === getHotelCode())?.name;
};

export const getMessageBirdWidgetId = () => {
  return configuration()?.find((c: any) => c?.code === getHotelCode())?.widgetId;
};
