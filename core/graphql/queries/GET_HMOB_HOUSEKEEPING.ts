import { gql } from '@apollo/client';

export interface IGetHousekeepingApiResponse {
  getServiceRequestDetails: {
    data: {
      code: string;
      confirmationMessage: string;
      createdAt: number;
      createdBy: string;
      customAttributes: [];
      customSchedule: string;
      description: string;
      hotelId: string;
      hours: {
        allTime: true;
        close: string;
        day: string[];
        everyday: true;
        open: string;
      }[];
      icon: string;
      id: string;
      images: {
        index: string;
        master: string;
      }[];
      isActive: boolean;
      isItemActive: boolean;
      items: {
        description: string;
        id: string;
        maxQuantityActive: boolean;
        maxQuantity: number;
        name: string;
      }[];
      maxQuantity: number;
      maxQuantityActive: boolean;
      name: string;
      pk: string;
      schedule: string[];
      scheduleActive: boolean;
    }[];
  };
}

export const GET_HOUSEKEEPINGDATA = gql`
  query GetServiceRequestDetails {
    getServiceRequestDetails
      @rest(type: "GetHouseKeepingPayload", path: "/property/housekeeping", method: "GET") {
      errors
      data
      status
    }
  }
`;
