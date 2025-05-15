import { makeVar } from '@apollo/client';

export type IDiningStorageData = {
  selectedMenu?: string;
  selectedCategory?: string;
  categoryName?: string;
  menuName?: string;
};

export const diningInformationStorage = makeVar<IDiningStorageData | null>(null);
export const irdMenuOutputDetailsStorage = makeVar<any>(null);
