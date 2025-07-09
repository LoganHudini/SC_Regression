import { makeVar } from '@apollo/client';
import { IGetActivityCategoriesApiResponse } from 'core/graphql/queries/GET_ACTIVITY_CATEGORIES';

export type IActivityCategoriesStorageData = {
  selectedCategories: {
    id: string;
    categoryCode: string;
    name: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }[];

  currentcurrentItem?: IGetActivityCategoriesApiResponse;
};

export const activityCategoriesStorage = makeVar<IActivityCategoriesStorageData>({
  selectedCategories: [],
});
