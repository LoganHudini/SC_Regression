import { makeVar } from '@apollo/client';
import { IGetHousekeepingApiResponse } from 'core/graphql/queries/GET_HOUSEKEEPING';
import { SERVICE_REQUEST_OPTIONS } from 'utils/constants';

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

export type IhousekeepingOptionsProps = {
  id: string;
  title: string;
  label: string;
};

export const housekeepingStorage = makeVar<IHousekeepingStorageData>({ selectedItems: [] });

export const housekeepingOptions = makeVar<IhousekeepingOptionsProps>(SERVICE_REQUEST_OPTIONS[0]);
