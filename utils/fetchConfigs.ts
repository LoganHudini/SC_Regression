import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';

const queryString: any = typeof window !== 'undefined' && window?.location?.pathname;

export const getHotelCode = () =>
  (queryString !== false && queryString?.split('/')[2]) ??
  (typeof window !== 'undefined' &&
    localStorage.getItem('hotel') &&
    JSON.parse(localStorage.getItem('hotel') ?? ''));

export const getHotelId = () => {
  return configuration?.find((configuration: any) => configuration?.code === getHotelCode())
    ?.hotelId;
};

export const getFetchFromDb = () => {
  return configuration?.find((configuration: any) => configuration?.code === getHotelCode())
    ?.fetchFromDb;
};

export const getHotelName = () => {
  return configuration?.find((configuration: any) => configuration?.code === getHotelCode())?.name;
};
