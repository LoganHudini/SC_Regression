import { gql } from '@apollo/client';
import { UIConfiguration } from '../../../types/UIConfiguration.types';
import { HOTEL_ID } from '../endpoints';

export interface IHotelPage {
  hotelId: string;
  id: string;
  name: string;
  status: string;
  uiConfiguration: string;
  updatedAt: string;
  updatedBy: string;
  version: string;
}

export type IParsedHotelPage = Omit<IHotelPage, 'uiConfiguration'> & {
  uiConfiguration: UIConfiguration;
};

export interface IGetHotelInfoApiResponse {
  listUiBuilderPages: IHotelPage[];
}

export const GET_HOTEL_INFO = gql`
      query MyQuery {
        listUiBuilderPages(hotelId: "${HOTEL_ID}") {
          hotelId
          id
          name
          status
          uiConfiguration
        }
      }
    `;
