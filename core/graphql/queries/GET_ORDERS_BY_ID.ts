import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_ORDERS = gql`
  query MyQuery(
    $bookingId:String!
    $lang: String,
    ) {
    getOrdersByBookingId(input: { bookingId:$bookingId, hotelId: "${HOTEL_ID}", lang: $lang,orderStatuses: ["NEW_ORDER", "ACCEPTED"] }) {
      additionalNote
      completedTime
      createdAt
      createdBy
      delayReason
      deliveryLocation
      guestName
      hotelId
      id
      items {
        addOns {
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
        name
      }
      lang
      noOfItems
      paymentMethod
      roomNo
      startTime
      status
      totalAmount
    }
  }
`;
