export interface IDiningMenuElementProps {
  title: string;
  description: string;
  price: number;
  id: string;
  image: string | null;
  code: string;
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
