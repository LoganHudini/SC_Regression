import { gql } from '@apollo/client';

export interface IGetHotelPagesResponse {
  listUiBuilderPages: { id: string; name: string; status: string }[];
}

export const GET_HOTEL_PAGES = gql`
  query MyQuery($hotelId: String!) {
    listUiBuilderPages(hotelId: $hotelId) {
      id
      name
      status
    }
  }
`;
