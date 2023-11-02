import { gql } from '@apollo/client';

export interface IGetHamburgerMenuDetailsApiResponse {
  getUiBuilderHamburgerMenuDetails: {
    post: {
      category: string;
      externalLink: string;
      flow: string;
      pages: string[];
      redirectOptions: string;
      menuIconUrl?: any;
      hotelId: string;
      id: string;
      isActive: string;
      name: string;
    }[];
    pre: {
      category: string;
      externalLink: string;
      flow: string;
      hotelId: string;
      id: string;
      menuIconUrl?: any;
      isActive: string;
      name: string;
      pages: string[];
      redirectOptions: string;
    }[];
  };
}

export const GET_HAMBURGER_MENU = gql`
  query MyQuery($hotelId: String!, $lang: String) {
    getUiBuilderHamburgerMenuDetails(input: { hotelId: $hotelId, lang: $lang }) {
      post {
        category
        externalLink
        flow
        hotelId
        id
        menuIconUrl
        isActive
        name
        pages
        redirectOptions
      }
      pre {
        category
        externalLink
        flow
        hotelId
        id
        menuIconUrl
        isActive
        name
        pages
        redirectOptions
      }
    }
  }
`;
