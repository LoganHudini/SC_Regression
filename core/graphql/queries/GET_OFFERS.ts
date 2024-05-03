import { gql } from '@apollo/client';

export const GET_OFFERS = gql`
  query MyQuery($hotelId: String!, $lang: String) {
    getOffersDetails(input: { hotelId: $hotelId, lang: $lang }) {
      createdAt
      createdBy
      description
      isActive
      name
      hotelId
      id
      highLights
      customAttributes {
        key
        value
      }
      CTA {
        URL
        cardPlacement
        contact
        emailId
        phoneCode
        phoneNumber
        redirectTo
        type
        status
        displayCTATitle
        redirectData
      }
      duration {
        alwaysActive
        endDate
        endTime
        startDate
        startTime
      }
      notification {
        createdAt
        description
        devices
        name
      }
      images {
        fileName
        index
        master
        ratio16to9
        ratio1to1
        ratio21to9
      }
      contact {
        email
        phoneNumber
      }
      pk
      sk
      type
      updatedAt
      updatedBy
      version
    }
  }
`;
