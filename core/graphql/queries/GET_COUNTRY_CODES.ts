import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface IGetCountryCodesApiResponse {
  getCountryCodes: { status: string; data: null | { code: string; name: string }[] };
}

export const GET_COUNTRY_CODES = gql`
  query GetCountryCodes($confirmationNumber: String) {
    getCountryCodes(confirmationNumber: $confirmationNumber)
      @rest(
        type: "GetCountryCodesPayload"
        path: "/${ENVIRONMENT}/hotel/${HOTEL_ID}/booking/countrycodes"
      ) {
      errors
      data
      status
    }
  }
`;
