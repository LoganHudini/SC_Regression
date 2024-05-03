import { makeVar } from '@apollo/client';

export type IPersonalizeYourRoomStorageData = {
  id: string;
  title: string;
  quantity: any;
  price: string;
  currency?: string;
  selected?: boolean;
}[];

export type IupgradeYourRoomStorageData = {
  id: string;
  title: string;
  quantity: any;
  price: string;
  currency?: string;
  selected?: boolean;
  code?: any;
}[];

export const personalizeYourRoomStorage = makeVar<IPersonalizeYourRoomStorageData>([]);

export const upgradeYourRoomStorage = makeVar<IupgradeYourRoomStorageData>([]);

export const personalizationStorage = makeVar([]);
