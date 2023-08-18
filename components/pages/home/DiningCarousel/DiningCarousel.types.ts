export interface IDiningCarouselProps {
  data: {
    categories: {
      id: string;
      isActive: boolean;
      name: string;
      items: {
        id: string;
        isActive: boolean;
        name: string;
        ingredients: string;
        customisation: {
          ingredient: string;
          customisations: {
            code: string;
            id: string;
            name: string;
            status: boolean;
          }[];
        }[];
        addOnLimit: boolean;
        addOnValue?: number;
        addons:
          | {
              code: string;
              id: string;
              name: string;
              price: number;
              status: boolean;
            }[]
          | null;
        allergens:
          | {
              code: string;
              id: string;
              name: string;
              status: boolean;
            }[]
          | null;
        upsell:
          | {
              code: string;
              description: string;
              id: string;
              name: string;
              price: number;
              images: {
                fileName: string;
                index: string;
                master: string;
              }[];
            }[]
          | null;
        code: string;
        description: string;
        price: number;
        tags: {
          code: string;
          id: string;
          name: string;
        }[];
        type: string;
        images: {
          ratio16to9: string;
          fileName: string;
          index: string;
          master: string;
        }[];
      }[];
      subCategories: {
        id: string;
        isActive: boolean;
        name: string;
        items: {
          id: string;
          isActive: boolean;
          name: string;
          ingredients: string;
          customisation: {
            ingredient: string;
            customisations: {
              code: string;
              id: string;
              name: string;
              status: boolean;
            }[];
          }[];
          addOnLimit: boolean;
          addOnValue?: number;
          addons:
            | {
                code: string;
                id: string;
                name: string;
                price: number;
                status: boolean;
              }[]
            | null;
          allergens:
            | {
                code: string;
                id: string;
                name: string;
                price: number;
                status: boolean;
              }[]
            | null;
          upsell:
            | {
                code: string;
                description: string;
                id: string;
                name: string;
                price: number;
                images: {
                  fileName: string;
                  index: string;
                  master: string;
                }[];
              }[]
            | null;
          code: string;
          description: string;
          price: number;
          tags: {
            code: string;
            id: string;
            name: string;
          }[];
          type: string;
          images: {
            ratio16to9: string;
            fileName: string;
            index: string;
            master: string;
          }[];
        }[];
      }[];
    }[];
    code: string;
    createdAt: number;
    createdBy: string;
    description: string;
    hotelId: string;
    hours: {
      close: string;
      day: string;
      open: string;
    }[];
    id: string;
    images: {
      fileName: string;
      index: string;
      master: string;
    }[];
    isActive: string;
    name: string;
    pk: string;
    sk: string;
    updatedAt: number;
    updatedBy: string;
    version: string;
  }[];
}
