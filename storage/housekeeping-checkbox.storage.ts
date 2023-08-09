import { makeVar } from '@apollo/client';

export type IHousekeepingCheckboxStorageData = {
  selectedItems: {
    itemId: string;
    quantity: number;
    requested?: boolean;
  }[];
};

export const housekeepingCheckboxStorage = makeVar<IHousekeepingCheckboxStorageData>({
  selectedItems: [],
});
