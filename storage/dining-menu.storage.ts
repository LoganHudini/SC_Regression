import { makeVar } from '@apollo/client';

export type IDiningMenuStorageData = {
  items: {
    itemId?: string;
    quantity: number;
    price: number;
    title: string;
    code: string;
    cookingInstruction?: string;
    customisation?:
      | {
          ingredient: string;
          name: string;
          code: string;
          id: string;
        }[]
      | any;
    addons?:
      | {
          code: string;
          id: string;
          name: string;
          price: number;
          comment?: string;
          quantity?: number;
        }[]
      | any;
    upsell?: {
      code?: string;
      description?: string;
      id?: string;
      name?: string;
      price?: number;
      images?: {
        fileName?: string;
        index?: string;
        master?: string;
      }[];
    }[];
  }[];
  selectedItemId?: string;
  selectedIndex?: number;
  orderId?: string;
};

export const diningMenuStorage = makeVar<IDiningMenuStorageData>({ items: [] });

export const diningCategoryStorage = makeVar<any>([]);

export type IScrollPosition = {
  scrollX: number;
  scrollY: number;
};

export const scrollState = makeVar<IScrollPosition>({ scrollX: 0, scrollY: 0 });

export interface ICustomisation {
  ingredient: string;
  name: string;
  code: string;
}

export interface IAddons {
  addons: {
    code: string;
    id: string;
    name: string;
    price: number;
  }[];
}

export const toggleDiningDetailsDrawer = makeVar(false);

export const editControl = makeVar(false);
