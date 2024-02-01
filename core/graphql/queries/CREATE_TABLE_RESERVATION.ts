import { gql } from '@apollo/client';

export interface ICreateTableReservationApiRequest {
  Date: string;
  Time: string;
  PartySize: number;
  Firstname: string;
  Lastname: string;
  Phone: string;
  ReservationId: string;
  Email: string;
  Country: string;
}

export const CREATE_TABLE_RESERVATION = gql`
  query CreateTableReservation(
    $confirmationNumber: String
    $body: ICreateTableReservationApiRequest
  ) {
    createTableReservation(confirmationNumber: $confirmationNumber, body: $body)
      @rest(
        type: "CreateTableReservationPayload"
        path: "/venues/venueId/book"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;
