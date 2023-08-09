import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IGetHamburgerMenuDetailsApiResponse {
  getUiBuilderHamburgerMenuDetails: {
    post: {
      category: string;
      externalLink: string;
      flow: string;
      pages: string[];
      redirectOptions: string;
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
      isActive: string;
      name: string;
      pages: string[];
      redirectOptions: string;
    }[];
  };
}

export const GET_HAMBURGER_MENU = gql`
 query MyQuery {
    getUiBuilderHamburgerMenuDetails(
      input: { hotelId:  "${HOTEL_ID}", lang: "" }
    ) {
      post {
        category
        externalLink
        flow
        hotelId
        id
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
        isActive
        name
        pages
        redirectOptions
      }
    }
  }
`;
