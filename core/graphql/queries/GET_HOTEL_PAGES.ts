import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IGetHotelPagesResponse {
  listUiBuilderPages: { id: string; name: string; status: string }[];
}

export const GET_HOTEL_PAGES = gql`
      query MyQuery {
        listUiBuilderPages(hotelId: "${HOTEL_ID}") {
          id
          name
          status
        }
      }
    `;
