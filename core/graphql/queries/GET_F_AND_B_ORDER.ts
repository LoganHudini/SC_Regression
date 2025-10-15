import { gql } from '@apollo/client';

export interface IUploadDocumentTypesApiResponse {
  getDocumentTypes: { status: string; data: null | { code: string; name: string }[] };
}

export const GET_F_AND_B_ORDER = gql`
  query MyQuery($restaurantId: String!, $tableNumber: String!, $lang: String, $hotelId: String) {
    getFAndBOrderDetails(
      input: {
        hotelId: $hotelId
        restaurantId: $restaurantId
        lang: $lang
        table: $tableNumber
        sortOrder: -1
        orderStatuses: [NEW_ORDER, PREPARING, DELIVERED]
      }
    ) {
      orders {
        status
        completedTime
        guestName
        guestType
        hotelId
        id
        items {
          addons {
            code
            name
            price
          }
          amount
          code
          cookingInstructions
          count
          customisations {
            code
            name
          }
          image
          name
        }
        lang
        totalAmount
        noOfGuests
        noOfItems
        pk
        restaurantId
        sk
        startTime
        tableNumber
      }
      bills {
        completedTime
        guestName
        guestType
        hotelId
        id
        lang
        noOfGuests
        noOfItems
        orders {
          id
          items {
            addons {
              code
              name
              price
            }
            amount
            code
            cookingInstructions
            count
            customisations {
              code
              name
            }
            image
            name
          }
        }
        pk
        restaurantId
        sk
        startTime
        status
        tableNumber
      }
    }
  }
`;
