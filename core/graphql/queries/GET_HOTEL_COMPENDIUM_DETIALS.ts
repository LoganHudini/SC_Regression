import { gql } from '@apollo/client';

export const GET_HOTEL_COMPENDIUM = gql`
  query MyQuery($hotelId: String!, $lang: String) {
    getHotelAmenityDetails(input: { hotelId: $hotelId, lang: $lang }) {
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
