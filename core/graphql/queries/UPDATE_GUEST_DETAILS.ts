import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IUpdateGuestDetailsApiRequest {
  reservationId: string;
  firstName: string;
  lastName: string;
  profileId: string;
  docType?: string;
  docNumber?: string;
  effectiveDate?: string;
  expiryDate?: string;
  placeOfIssue?: string;
  countryOfIssue?: string;
  isPrimary: string;
  guestDocument?: string;
  channel: string;
  updateGuestDetails: {
    name?: {
      firstName: string;
      lastName: string;
      gender?: string;
      nationality?: string;
      dob?: string;
      profession?: string;
    };
    address?: {
      id: string;
      addressLine1?: string;
      addressLine2?: string;
      addressType?: string;
      stateProv?: string;
      city?: string;
      countryCode?: string;
      postalCode?: string;
    };
    phone?: {
      id?: string;
      phoneType: string;
      phoneNumber: string;
      phoneRole: string;
    };
    email?: {
      id?: string;
      email: string;
    };
  };
}

export interface IUpdateGuestDetailsApiResponse {
  updateGuestDetails: { status: string; data: Record<string, never> };
}

export const UPDATE_GUEST_DETAILS = gql`
query UpdateGuestDetails($confirmationNumber: String, $body: UpdateGuestDetailsPayload) {
  updateGuestDetails(confirmationNumber: $confirmationNumber, body: $body)
    @rest(
      type: "UpdateGuestDetailsPayload"
      path: "/v5/booking/hotel/${HOTEL_ID}/bookings/{args.confirmationNumber}/document?confirmationId={args.confirmationNumber}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;
