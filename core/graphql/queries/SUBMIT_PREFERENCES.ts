import { gql } from '@apollo/client';

export interface SubmitGuestPreferencesPayload {
  bookingId: string;
  reservationId: string;
  profileId: string;
  preferences: {
    preferenceType: string;
    preference: {
      preferenceValue: string;
    }[];
  }[];
}

export interface ISubmitGuestPreferencesApiResponse {
  submitGuestPreferences: {
    status: string;
    data: any;
    errors: any;
  };
}

export const SUBMIT_PREFERENCES = gql`
  query SubmitPreferences(
    $body: SubmitGuestPreferencesPayload
    $reservationId: String!
    $hotelId: String!
    $confirmationNumber: String
  ) {
    submitGuestPreferences(
      body: $body
      reservationId: $reservationId
      hotelId: $hotelId
      confirmationNumber: $confirmationNumber
    )
      @rest(
        type: "SubmitGuestPreferencesResponse"
        path: "/booking/hotel/{args.hotelId}/reservation/{args.reservationId}"
        method: "PUT"
        bodyKey: "body"
      ) {
      data
      errors
      status
    }
  }
`;
