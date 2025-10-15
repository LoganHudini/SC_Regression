import { gql } from '@apollo/client';

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
  updateGuestDetails: {
    name: {
      firstName: string;
      lastName: string;
      dob?: string;
      nationality?: string;
    };
    address: {
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
      id: string;
      phoneType: string;
      phoneNumber: string;
      phoneRole: string;
    };
    email?: {
      id: string;
      email: string;
    };
  };
}

export interface IUpdateGuestDetailsApiResponse {
  updateGuestDetails: { status: string; data: Record<string, never> };
}

export const ADD_ACCOMPANY_GUEST: any = gql`
  query AddAccompanyDetails(
    $confirmationNumber: String
    $body: AddAccompanyDetailsPayload
    $hotelId: String
  ) {
    addAccompanyDetails(confirmationNumber: $confirmationNumber, body: $body, hotelId: $hotelId)
      @rest(
        type: "AddAccompanyDetailsPayload"
        path: "/hotel/{args.hotelId}/booking/{args.confirmationNumber}/guest/add"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;
