import { gql } from '@apollo/client';

export const GET_SPA_DETAILS = gql`
  query GetSpaDetails($hotelId: String!, $lang: String) {
    getSpaDetails(input: { hotelId: $hotelId, lang: $lang }) {
      categories {
        hotelId
        spaId
        id
        code
        name
        createdBy
        createdAt
        updatedBy
        updatedAt
        version
      }
      spa {
        hotelId
        id
        code
        name
        description
        isActive
        treatmentsMenu
        treatmentsMenuType
        customAttributes {
          key
          value
        }
        hours {
          everyday
          allTime
          timings {
            day
            from
            to
          }
        }
        contact {
          email
          phone
          information {
            type
            reviewerTitle
            url
            displayTitle
          }
        }
        location {
          addressLine1
          addressLine2
          country
          state
          city
          area
          postalCode
          latitude
          longitude
          timeZone
        }
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
        }
        createdBy
        createdAt
        updatedBy
        updatedAt
        version
      }
      treatments {
        hotelId
        code
        description
        isActive
        customAttributes {
          key
          value
        }
        disclaimer
        duration {
          duration
          price
        }
        id
        images {
          ratio16to9
          ratio21to9
          ratio1to1
          fileName
          index
          master
        }
        name
        spaCategoryId
        spaId
        type
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  }
`;
