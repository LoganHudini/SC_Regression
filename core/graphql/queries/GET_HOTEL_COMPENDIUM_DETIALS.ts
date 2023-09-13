import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_HOTEL_COMPENDIUM = gql`
  query MyQuery {
    getHotelAmenityDetails(input: { hotelId: "${HOTEL_ID}", lang: "" }) {
      amenities {
        categoryId
        categoryIds
        createdAt
        createdBy
        description
        highlights
        hotelId
        id
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
        }
        information {
          displayTitle
          field
          index
          type
          value
        }
        isActive
        name
        pk
        sk
        updatedAt
        updatedBy
        version
      }
      categories {
        createdAt
        createdBy
        hotelId
        id
        name
        sk
        pk
        updatedAt
        updatedBy
        version
      }
    }
  }
`;
