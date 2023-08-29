import { makeVar } from '@apollo/client';

export type IAccompanyGuestDetailsStorageData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  docNo?: string;
};

export const accompanyGuestDetails = makeVar<IAccompanyGuestDetailsStorageData | any>(null);
