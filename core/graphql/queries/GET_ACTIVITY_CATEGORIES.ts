import { gql } from '@apollo/client';

export interface IGetActivityCategoriesApiResponse {
  getActivityCategories: {
    data: {
      categoryCode: string;
      createdAt: string;
      createdBy: string;
      hotelId: string;
      id: string;
      isActive: boolean;
      name: string;
      customAttributes: {
        key: string;
        value: string;
      }[];
      updatedAt: string;
      updatedBy: string;
      images: {
        fileName: string;
        index: number;
        master: string;
        ratio16to9: string;
        ratio1to1: string;
        ratio21to9: string;
        ratio9to16: string;
        ratio9to21: string;
      }[];
    }[];
  };
}

export const GET_ACTIVITY_CATEGORIES = gql`
  query GetActivityCategories($hotelId: String!, $lang: String) {
    getActivityCategories(input: { hotelId: $hotelId, lang: $lang }) {
      categoryCode
      createdAt
      createdBy
      hotelId
      id
      isActive
      name
      customAttributes {
        key
        value
      }
      updatedAt
      updatedBy
      images {
        fileName
        index
        master
        ratio16to9
        ratio1to1
        ratio21to9
        ratio9to16
        ratio9to21
      }
    }
  }
`;
