import { gql } from '@apollo/client';

export const GET_E_REG_DETAILS = gql`
  query MyQuery($hotelId: String!) {
    getHotelSystemsDigitalCheckinConfig(input: { hotelId: $hotelId }) {
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
