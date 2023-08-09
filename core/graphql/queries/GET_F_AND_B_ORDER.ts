import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IUploadDocumentTypesApiResponse {
  getDocumentTypes: { status: string; data: null | { code: string; name: string }[] };
}

export const GET_F_AND_B_ORDER = gql`
  query MyQuery (
    $restaurantId:String!,
    $tableNumber:String!,
    $lang: String,
    ){
    getFAndBOrderDetails(
      input: {
        hotelId: "${HOTEL_ID}"
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
