import { makeVar } from '@apollo/client';

export type IPersonalizeYourRoomStorageData = {
  code: string;
  title: string;
  quantity: any;
  price: string;
  currency?: string;
}[];

export const personalizeYourRoomStorage = makeVar<IPersonalizeYourRoomStorageData>([]);
export const specialRequestsStorage = makeVar('');
