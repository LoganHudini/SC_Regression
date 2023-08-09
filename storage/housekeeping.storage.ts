import { makeVar } from '@apollo/client';
import { IGetHousekeepingApiResponse } from 'core/graphql/queries/GET_HOUSEKEEPING';

export type IHousekeepingStorageData = {
  selectedItems: {
    itemId: string;
    code: string;
    name: string;
    quantity: number;
    date?: string;
    time?: string;
    schedule?: string;
    requested?: boolean;
  }[];

  currentItem?: IGetHousekeepingApiResponse['getServiceRequestDetails'][
    | 'houseKeeping'
    | 'concierge'][number];
  requestModalOpened?: boolean;
};

export const housekeepingStorage = makeVar<IHousekeepingStorageData>({ selectedItems: [] });
