import { gql } from '@apollo/client';

export interface IGetActivityTagsApiResponse {
  getActivityTags: {
    hotelId: string;
    id: string;
    name: string;
  }[];
}

export const GET_ACTIVITY_TAGS = gql`
  query GetActivityTags($hotelId: String!, $lang: String) {
    getActivityTags(input: { hotelId: $hotelId, lang: $lang }) {
      hotelId
      id
      name
    }
  }
`;
