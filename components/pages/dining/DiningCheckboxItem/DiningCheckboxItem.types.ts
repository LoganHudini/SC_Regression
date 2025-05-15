import { Dispatch, SetStateAction } from 'react';

export interface IDiningCheckboxItemProps {
  element: { code: string; id: string; name: string; price: number };
  selectedItemId?: string;
  setupdateAddons?: any;
  checked?: any;
  groupedAddonIndex?: number;
  updateAddons?: boolean | undefined;
  addons:
    | {
        code: string;
        id: string;
        name: string;
        price: number;
        index?: any;
      }[]
    | undefined;
  setAddons: Dispatch<
    SetStateAction<
      | {
          code: string;
          id: string;
          name: string;
          price: number;
          index?: any;
        }[]
      | undefined
    >
  >;
}
