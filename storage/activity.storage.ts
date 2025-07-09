import { makeVar } from '@apollo/client';
import { IGetActivitiesApiResponse } from 'core/graphql/queries/GET_ACTIVITY';

export type IActivityStorageData = {
  selectedActivities: {
    id: string;
    name: string;
    isActive: boolean;
    categoryId: string;
    categoryName: string;
    createdAt?: string;
    updatedAt?: string;
  }[];

  currentActivityItem?: IGetActivitiesApiResponse;
};

export const activityStorage = makeVar<IActivityStorageData>({
  selectedActivities: [],
});
