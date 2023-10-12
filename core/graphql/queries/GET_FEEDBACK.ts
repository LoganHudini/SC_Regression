import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';
export const GET_FEEDBACK = gql`
query MyQuery($lang: String) {
    listFeedback(hotelId:  "${HOTEL_ID}", lang: $lang) {
      destination
      duration
      hotelId
      id
      isActive
      pageTitle
      subtext
      feedbackCategories {
        title
        type
      }
    }
  }`;
