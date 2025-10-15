import { gql } from '@apollo/client';

export interface IRDDetailsApiResponse {
  getIRDDetails: {
    addons: [];
    allergens: [];
    bundles: [];
    categories: {
      id: string;
      hotelId: string;
      code: string;
      name: string;
      status: boolean;
      description: string;
      createdAt: number;
      customAttributes: [];
      hours: {
        everyday: boolean;
        allTime: boolean;
        timings: {
          day: string;
          from: string;
          to: string;
        }[];
      };
      images: {
        index: number;
        fileName: string;
        master: string;
      }[];
    }[];
    customisations: [];
    discounts: [];
    items: {
      id: string;
      hotelId: string;
      code: string;
      name: string;
      status: boolean;
      type: string;
      price: number;
      description: string;
      ingredients: string;
      allergens: null;
      tags: null;
      customAttributes: [];
      images: {
        index: number;
        fileName: string;
        master: string;
      }[];
      addons: {
        type: string;
        limit: boolean;
        value: 0;
        addons: [];
        groupedAddon: [];
      };
      customisation: {
        status: boolean;
        ingredients: [];
      };
      upsell: {
        status: boolean;
        items: string[];
      };
      discount: {
        status: boolean;
        discount: string;
      };
    }[];
    kinds: {
      code: string;
      createdAt: number;
      createdBy: string;
      hotelId: string;
      id: string;
      name: string;
      pk: string;
      sk: string;
      status: string;
      updatedAt: number;
      updatedBy: string;
      version: number;
    }[];
    tags: [];
  };
}

export const IRD_DETAILS = gql`
  query GetIRDDetails($hotelId: String) {
    getIRDDetails(input: { hotelId: $hotelId }) {
      categories {
        id
        hotelId
        code
        name
        status
        description
        createdAt
        customAttributes {
          key
          value
        }
        hours {
          everyday
          allTime
          timings {
            day
            from
            to
          }
        }
        images {
          index
          fileName
          master
        }
      }

      items {
        id
        hotelId
        code
        name
        status
        type
        price
        description
        ingredients
        allergens
        tags
        images {
          fileName
          index
          master
        }
        upsell {
          status
          items
        }
      }
    }
  }
`;
