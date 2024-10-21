import { gql } from '@apollo/client';

export const GET_HOTEL_COMPENDIUM = gql`
  query MyQuery($hotelId: String!, $lang: String) {
    getHotelAmenityDetails(input: { hotelId: $hotelId, lang: $lang }) {
      categories {
        createdBy
        customAttributes {
          key
          value
        }
        hotelId
        id
        name
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
          ratio9to21
          ratio9to16
        }
      }
      amenities {
        name
        categoryIds
        createdBy
        customAttributes {
          key
          value
        }
        description
        highlights
        hotelId
        id
        isActive
        information {
          field
          index
          value
          type
          displayTitle
        }
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
          ratio9to16
          ratio9to21
        }
      }
    }
  }
`;
