import { gql } from '@apollo/client';

export const CREATE_SPA_ORDER = gql`
  mutation MyMutation(
    $bookingId: String
    $hotelId: String!
    $bookingTime: String!
    $roomNo: String!
    $guestName: String!
    $guestEmail: String
    $guestType: String!
    $numberOfGuest: Int!
    $pax: String!
    $femalePax: String
    $maleFax: String
    $scheduledDate: String!
    $scheduledTime: String!
    $treatmentDuration: String!
    $totalAmount: String!
    $items: [SpaItemDetailsInput]!
    $spaId: String!
    $spaName: String!
    $lang: String
  ) {
    createSpaOrder(
      input: {
        bookingId: $bookingId
        bookingTime: $bookingTime
        femalePax: $femalePax
        guestEmail: $guestEmail
        guestName: $guestName
        hotelId: $hotelId
        items: $items
        lang: $lang
        maleFax: $maleFax
        numberOfGuest: $numberOfGuest
        pax: $pax
        roomNo: $roomNo
        scheduledDate: $scheduledDate
        scheduledTime: $scheduledTime
        spaName: $spaName
        spaId: $spaId
        totalAmount: $totalAmount
        treatmentDuration: $treatmentDuration
        guestType: $guestType
      }
    ) {
      bookingId
      bookingTime
      createdAt
      createdBy
      femalePax
      guestName
      guestType
      hotelId
      id
      items {
        amount
        description
        id
        name
        specialRequest
        treatmentDuration
      }
      lang
      maleFax
      numberOfGuest
      pax
      roomNo
      pk
      scheduledDate
      scheduledTime
      sk
      spaId
      spaName
      status
      treatmentDuration
      totalAmount
      updatedAt
      updatedBy
      version
    }
  }
`;
