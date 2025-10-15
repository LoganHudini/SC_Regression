import { gql } from '@apollo/client';

export const CREATE_FANDB_ORDER = gql`
  mutation MyMutation(
    $additionalNote: String!
    $guestName: String!
    $guestType: String!
    $items: [FAndBOrderItemInput]!
    $noOfGuests: Int!
    $noOfItems: Int!
    $phoneNumber: String
    $restaurantId: String!
    $roomNo: String!
    $startTime: String!
    $tableNumber: String!
    $totalAmount: Float!
    $paymentMethod: String!
    $lang: String
    $hotelId: String
  ) {
    createFAndBOrder(
      input: {
        additionalNote: $additionalNote
        guestName: $guestName
        guestType: $guestType
        hotelId: $hotelId
        items: $items
        noOfGuests: $noOfGuests
        noOfItems: $noOfItems
        phoneNumber: $phoneNumber
        restaurantId: $restaurantId
        roomNumber: $roomNo
        startTime: $startTime
        tableNumber: $tableNumber
        totalAmount: $totalAmount
        paymentMethod: $paymentMethod
        lang: $lang
      }
    ) {
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
        name
        image
      }
      lang
      totalAmount
      noOfGuests
      noOfItems
      pk
      restaurantId
      sk
      startTime
      status
      tableNumber
    }
  }
`;
