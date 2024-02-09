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

export type IhousekeepingOptionsProps = {
  id: string;
  title: string;
  label: string;
};

export type IserviceRequestOptionsArrayProps = {
  id: string;
  title: string;
  label: string;
  carouselLabel: string;
}[];

export const housekeepingStorage = makeVar<IHousekeepingStorageData>({ selectedItems: [] });

export const serviceRequestOptionsArray: any = makeVar<IserviceRequestOptionsArrayProps>([]);

export const housekeepingOptions = makeVar<IhousekeepingOptionsProps>(
  serviceRequestOptionsArray?.length > 0 && serviceRequestOptionsArray[0],
);
