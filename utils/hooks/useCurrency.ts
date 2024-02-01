import { hotelInfoStorage } from 'storage/home.storage';
import { useReactiveVar } from '@apollo/client';

export const useCurrency = () => {
  const hotelInfo = useReactiveVar(hotelInfoStorage);
  const currency = hotelInfo?.getPropertyDetailsByHotelId?.hotel?.currency ?? '';
  return currency;
};
