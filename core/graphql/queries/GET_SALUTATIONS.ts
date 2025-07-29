import { gql } from '@apollo/client';

export const GET_SALUTATIONS = gql`
  query GetSalutations($hotelId: String!, $lang: String) {
    getLov(input: { hotelId: $hotelId, lang: $lang, listName: "title" }) {
      hotelId
      lists {
        languages {
          lang
          values {
            id
            name
          }
        }
        listName
      }
    }
  }
`;

export interface ISalutationValue {
  id: string;
  name: string;
}

export interface ISalutationLanguage {
  lang: string;
  values: ISalutationValue[];
}

export interface ISalutationList {
  languages: ISalutationLanguage[];
  listName: string;
}

export interface IGetSalutationsResponse {
  getLov: {
    hotelId: string;
    lists: ISalutationList[];
  }[];
}
