import { gql } from '@apollo/client';

export const GET_HOTEL_INFORMATION = gql`
  query MyQuery($hotelId: String!, $lang: String) {
    getPropertyDetailsByHotelId(input: { hotelId: $hotelId, lang: $lang }) {
      hotel {
        brandId
        cancellationPolicy {
          name
          type
          url
        }
        checkInTime
        checkOutTime
        code
        createdAt
        createdBy
        currency
        covid19Regulations {
          name
          url
          type
        }
        dataProtection {
          type
          name
          url
        }
        description
        detailsCustomAttributes {
          value
          key
        }
        devicesEndpoint
        features
        firebaseToken
        groupId
        gsi1pk
        gsi2sk
        gsi1sk
        gsi2pk
        id
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
        }
        interests
        isDevicesEnabled
        isUIBuilderEnabled
        wcMessage {
          device {
            tablet
            tv
          }
          images {
            fileName
            index
            ratio16to9
            master
            ratio1to1
            ratio21to9
          }
          isImagesEnabled
          isWCMessageEnabled
          messageText
          signature {
            signatureTitle
            isSignatureEnabled
            images
          }
          video
        }
        version
        updatedBy
        updatedAt
        travelType
        termsAndConditions {
          name
          type
          url
        }
        starRating
        sk
        privacyLaws {
          name
          type
          url
        }
        pk
        phoneNumber
        name
        maxdevices
        location {
          addressLine1
          addressLine2
          latitude
          area
          country
          city
          longitude
          postalCode
          state
          timezone
        }
        informationCustomAttributes {
          key
          value
        }
        information {
          displayTitle
          field
          index
          type
          value
        }
      }
      brand {
        code
        createdAt
        description
        createdBy
        firebaseToken
        groupId
        gsi1pk
        gsi1sk
        id
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
        }
        name
        pk
        sk
        updatedAt
        updatedBy
        version
      }
      group {
        code
        customSenderEmail
        createdAt
        createdBy
        description
        firebaseToken
        sk
        pk
        name
        id
        updatedAt
        version
        updatedBy
        whiteLabellingConfigurations {
          appConfigs
          region
          userPoolId
          userPoolWebClientId
        }
      }
    }
  }
`;
