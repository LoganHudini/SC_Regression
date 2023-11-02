import { gql } from '@apollo/client';

export const GET_ORDERS = gql`
  query MyQuery($hotelId: String!, $bookingId: String!, $lang: String) {
    getOrdersByBookingId(
      input: {
        bookingId: $bookingId
        hotelId: $hotelId
        lang: $lang
        orderStatuses: ["NEW_ORDER", "ACCEPTED"]
      }
    ) {
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
