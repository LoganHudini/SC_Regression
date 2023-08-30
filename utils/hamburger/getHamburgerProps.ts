import { client } from 'core/graphql/client';
import {
  GET_HAMBURGER_MENU,
  IGetHamburgerMenuDetailsApiResponse,
} from 'core/graphql/queries/GET_HAMBURGER_MENU';
import urlSlug from 'url-slug';
import { GET_HOTEL_PAGES, IGetHotelPagesResponse } from 'core/graphql/queries/GET_HOTEL_PAGES';

export interface IHamburgerProps {
  hamburger?: IGetHamburgerMenuDetailsApiResponse['getUiBuilderHamburgerMenuDetails'];
  pages?: {
    path: string;
    id: string;
  }[];
  pageData?: string;
}

export const getHamburgerProps = async () => {
  const hamburgerData = await client.query<IGetHamburgerMenuDetailsApiResponse>({
    query: GET_HAMBURGER_MENU,
    context: { clientName: 'host_v4' },
  });

  const pagesData = await client.query<IGetHotelPagesResponse>({
    query: GET_HOTEL_PAGES,
  });

  const pages = pagesData.data.listUiBuilderPages
    .filter((page) => page.status === 'Published')
    .map((page) => {
      const pageName = urlSlug(page.name);

      return { path: pageName, id: page.id };
    });

  return {
    hamburger: hamburgerData.data.getUiBuilderHamburgerMenuDetails,
    pages,
  };
};
