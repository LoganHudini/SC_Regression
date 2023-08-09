import { IGetHousekeepingApiResponse } from 'core/graphql/queries/GET_HOUSEKEEPING';

export interface IHousekeepingConfirmProps {
  toggleOpened: () => void;
  opened: boolean;
  housekeepingItems?: IGetHousekeepingApiResponse['getServiceRequestDetails']['houseKeeping'];
  conciergeItems?: IGetHousekeepingApiResponse['getServiceRequestDetails']['concierge'];
}
