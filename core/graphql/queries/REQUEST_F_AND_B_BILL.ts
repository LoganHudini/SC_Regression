import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const REQUEST_F_AND_B_BILL = gql`
  mutation MyMutation(
    $guestName: String!,
    $guestType:String!,
    $noOfGuests: Int!,
    $phoneNumber: String,
    $restaurantId: String!,
    $roomNumber: String,
    $tableNumber: String!,
    $lang: String
  ) {
    requestFAndBBill(
      input: {
        guestName: $guestName,
        guestType: $guestType,
        hotelId: "${HOTEL_ID}",
        lang: $lang,
        noOfGuests: $noOfGuests,
        phoneNumber: $phoneNumber,
        restaurantId: $restaurantId,
        roomNumber: $roomNumber,
        tableNumber: $tableNumber,
      }
    ) {
      id
      completedTime
      guestName
      guestType
      hotelId
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
`;
