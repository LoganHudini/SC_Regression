import { IGetHousekeepingApiResponse } from 'core/graphql/queries/GET_HMOB_HOUSEKEEPING';
import { IParsedHotelPage } from 'core/graphql/queries/GET_HOTEL_INFO';

export interface IHousekeepingProps {
  pageData: IParsedHotelPage;
  paths: {
    path: string;
    id: string;
  }[];
  housekeepingData: IGetHousekeepingApiResponse;
}
