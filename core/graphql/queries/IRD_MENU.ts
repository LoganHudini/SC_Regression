import { gql } from '@apollo/client';

export interface IRDMenuApiResponse {
  getIRDMenuOutputDetails: {
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
              priceInDecimal: any;
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
                priceInDecimal: any;
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

export const IRD_MENU = gql`
  query MyQuery($hotelId: String!, $restaurantId: String, $lang: String) {
    getIRDMenuOutputDetails(
      input: { hotelId: $hotelId, restaurantId: $restaurantId, lang: $lang }
    ) {
      id
      isActive
      name
      categories {
        id
        name
        isActive
        items {
          id
          name
          addOnLimit
          addOnValue
          addons {
            code
            id
            name
            price
            status
            priceInDecimal
          }
          groupedAddon {
            addons {
              code
              id
              name
              price
              priceInDecimal
            }
            limit
            title
          }
          customisation {
            ingredient
            customisations {
              code
              id
              name
              status
            }
          }
          allergens {
            code
            id
            name
            status
          }
          code
          description
          discount {
            code
            description
            disclaimer
            name
            schedule {
              always
              from {
                date
                time
              }
              till {
                date
                time
              }
            }
            upto
            value
          }
          images {
            fileName
            index
            master
            ratio16to9
            ratio1to1
            ratio21to9
          }
          ingredients
          isActive
          price
          tags {
            code
            id
            name
          }
          type
          upsell {
            code
            description
            id
            name
            price
            images {
              fileName
              index
              master
              ratio16to9
              ratio1to1
              ratio21to9
            }
          }
        }
        hours {
          allTime
          everyday
          timings {
            day
            from
            to
          }
        }
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
        }
        subCategories {
          id
          isActive
          items {
            addOnValue
            addOnLimit
            addons {
              code
              id
              name
              price
              status
              priceInDecimal
            }
            allergens {
              code
              id
              name
              status
            }
            code
            customisation {
              customisations {
                code
                id
                name
                status
              }
              ingredient
            }
            description
            discount {
              code
              description
              disclaimer
              name
              schedule {
                always
                from {
                  date
                  time
                }
                till {
                  date
                  time
                }
              }
              upto
              value
            }
            groupedAddon {
              addons {
                code
                id
                name
                price
                priceInDecimal
              }
              limit
              title
            }
            id
            images {
              fileName
              index
              master
              ratio16to9
              ratio1to1
              ratio21to9
            }
            isActive
            ingredients
            name
            price
            tags {
              code
              id
              name
            }
            type
            upsell {
              description
              id
              name
              price
            }
          }
          name
        }
      }
      hours {
        close
        day
        open
      }
      images {
        index
        fileName
        master
        ratio16to9
        ratio1to1
        ratio21to9
      }
      hotelId
      description
      code
    }
  }
`;
