import { gql } from '@apollo/client';

export interface IUpdateReservationApiRequest {
  roomType: string;
  roomRate: string;
  reservationType: string;
  bookingId: string;
  reservationId: string;
  uniqueBookingId: string;
  personalisation: {
    code: string;
    quantity: string;
  }[];
  comments: string[];
  startDate: string;
  endDate: string;
}

export const UPDATE_RESERVATION = gql`
  query UpdateReservation(
    $confirmationNumber: String
    $body: IUpdateGuestDetailsApiRequest
    $hotelId: String
  ) {
    updateReservation(confirmationNumber: $confirmationNumber, body: $body, hotelId: $hotelId)
      @rest(
        type: "UpdateReservationPayload"
        path: "/booking/hotel/{args.hotelId}/reservation/{args.confirmationNumber}?Channel=PWA"
        method: "PUT"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;
