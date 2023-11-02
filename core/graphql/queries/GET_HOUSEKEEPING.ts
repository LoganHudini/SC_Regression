import { gql } from '@apollo/client';

export interface IGetHousekeepingApiResponse {
  getServiceRequestDetails: {
    houseKeeping: {
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
    concierge: {
      code: string;
      createdAt: number;
      createdBy: string;
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
      resident: boolean;
      schedule: string[];
      scheduleActive: boolean;
      sk: string;
      updatedAt: number;
      updatedBy: string;
      version: number;
    }[];
  };
}

export const GET_HOUSEKEEPING = gql`
  query MyQuery($hotelId: String!, $lang: String) {
    getServiceRequestDetails(input: { hotelId: $hotelId, lang: $lang }) {
      houseKeeping {
        code
        confirmationMessage
        customAttributes {
          key
          value
        }
        customSchedule
        description
        hotelId
        hours {
          allTime
          close
          day
          everyday
          open
        }
        icon
        id
        images {
          index
          master
        }
        isActive
        isItemActive
        items {
          description
          id
          maxQuantityActive
          maxQuantity
          name
        }
        maxQuantity
        maxQuantityActive
        name
        schedule
        scheduleActive
      }
      concierge {
        code
        createdAt
        confirmationMessage
        createdBy
        customSchedule
        description
        hotelId
        hours {
          allTime
          close
          everyday
          day
          open
        }
        icon
        id
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
        }
        isActive
        isItemActive
        items {
          description
          id
          maxQuantity
          maxQuantityActive
          name
        }
        maxQuantity
        maxQuantityActive
        name
        pk
        resident
        schedule
        scheduleActive
        sk
        updatedAt
        updatedBy
        version
      }
    }
  }
`;
