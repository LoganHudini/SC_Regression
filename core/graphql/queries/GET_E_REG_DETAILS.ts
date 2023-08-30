import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_E_REG_DETAILS = gql`
  query MyQuery {
    getHotelSystemsDigitalCheckinConfig(input: { hotelId: "${HOTEL_ID}" }) {
      eRegistrationForm {
        documentInformation {
          required
          name
        }
        guestInformation {
          name
          required
        }
        roomDetails {
          name
          required
        }
        travelInfo {
          name
          required
        }
      }
    }
  }
`;
