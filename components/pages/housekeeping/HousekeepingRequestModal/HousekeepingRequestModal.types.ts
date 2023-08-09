import { IGetHousekeepingApiResponse } from 'core/graphql/queries/GET_HOUSEKEEPING';

export interface IHousekeepingRequestModalProps {
  housekeepingItems?: IGetHousekeepingApiResponse['getServiceRequestDetails']['houseKeeping'];
}
