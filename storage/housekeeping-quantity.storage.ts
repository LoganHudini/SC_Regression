import { makeVar } from '@apollo/client';

export type IHousekeepingQuantityStorageData = {
  selectedItems: {
    itemId: string;
    quantity: number;
    requested?: boolean;
  }[];
};

export const housekeepingQuantityStorage = makeVar<IHousekeepingQuantityStorageData>({
  selectedItems: [],
});
