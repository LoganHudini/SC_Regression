import { makeVar } from '@apollo/client';

export type IPersonalizeYourRoomStorageData = {
  id: string;
  title: string;
  quantity: any;
  price: string;
  currency?: string;
  selected?: boolean;
}[];

export const personalizeYourRoomStorage = makeVar<IPersonalizeYourRoomStorageData>([]);
