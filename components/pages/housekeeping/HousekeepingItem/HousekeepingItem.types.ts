import { IGetHousekeepingApiResponse } from 'core/graphql/queries/GET_HOUSEKEEPING';

export interface IHousekeepingItemProps {
  housekeepingItem: IGetHousekeepingApiResponse['getServiceRequestDetails'][
    | 'houseKeeping'
    | 'concierge'][number];
}
