import { gql } from '@apollo/client';

export const GET_FEEDBACK = gql`
  query MyQuery($hotelId: String!, $lang: String) {
    listFeedback(hotelId: $hotelId, lang: $lang) {
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
  }
`;
