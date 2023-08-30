import { IGetHousekeepingApiResponse } from 'core/graphql/queries/GET_HOUSEKEEPING';

export interface IHousekeepingItemProps {
  handleClick?: any;
  housekeepingItem: IGetHousekeepingApiResponse['getServiceRequestDetails'][
    | 'houseKeeping'
    | 'concierge'][number];
}
