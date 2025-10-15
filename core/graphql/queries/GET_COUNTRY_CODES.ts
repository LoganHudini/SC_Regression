import { gql } from '@apollo/client';

export interface IGetCountryCodesApiResponse {
  getCountryCodes: { status: string; data: null | { code: string; name: string }[] };
}

export const GET_COUNTRY_CODES = gql`
  query GetCountryCodes($confirmationNumber: String, $hotelId: String) {
    getCountryCodes(confirmationNumber: $confirmationNumber, hotelId: $hotelId)
      @rest(type: "GetCountryCodesPayload", path: "/hotel/{args.hotelId}/booking/countrycodes") {
      errors
      data
      status
    }
  }
`;
