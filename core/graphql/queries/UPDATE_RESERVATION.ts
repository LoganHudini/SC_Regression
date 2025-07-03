import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

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
query UpdateReservation($confirmationNumber: String, $body:IUpdateGuestDetailsApiRequest) {
    updateReservation(confirmationNumber: $confirmationNumber, body: $body)
    @rest(
      type: "UpdateReservationPayload"
      path: "/booking/hotel/${HOTEL_ID}/reservation/{args.confirmationNumber}?Channel=PWA"
      method: "PUT"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;
