export interface IDiningMenuElementProps {
  menuAvailability?: boolean;
  title: string;
  ingredients?: string;
  description: string;
  price: number;
  id: string;
  image: string | null;
  code: string;
  tags?: any;
  allergens?: any;
  categoryName?: string;
  customisation: {
    ingredient: string;
    customisations: {
      code: string;
      id: string;
      name: string;
      status: boolean;
    }[];
  }[];
  index: number;
  addons?:
    | {
        code: string;
        id: string;
        name: string;
        price: number;
      }[]
    | null;
}
