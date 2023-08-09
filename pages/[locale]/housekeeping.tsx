import { client } from 'core/graphql/client';
import {
  IGetHotelInfoApiResponse,
  GET_HOTEL_INFO,
  IHotelPage,
  IParsedHotelPage,
} from 'core/graphql/queries/GET_HOTEL_INFO';
import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { getHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import urlSlug from 'url-slug';
import { HOUSEKEEPING_FLOW_VERSION } from 'utils/constants';
import { getStaticPaths } from 'utils/getStatic';
import { RotatingLines } from 'react-loader-spinner';

export { getStaticPaths };

const DynamicHousekeeping = dynamic(() => import(`./housekeeping.${HOUSEKEEPING_FLOW_VERSION}`), {
  loading: () => (
    <div className={'loaderWrapper'}>
      <RotatingLines strokeColor='grey' strokeWidth='5' width='100' visible={true} />
    </div>
  ),
});

const Housekeeping: NextPage = (props) => {
  return <DynamicHousekeeping {...props} />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  const { data } = await client.query<IGetHotelInfoApiResponse>({
    query: GET_HOTEL_INFO,
  });

  const pageData = data.listUiBuilderPages.find((el) => {
    const pageName = urlSlug(el.name);

    return pageName === 'housekeeping';
  }) as IHotelPage;

  const updatedPageData: IParsedHotelPage = {
    ...pageData,
    uiConfiguration: JSON.parse(pageData?.uiConfiguration || '[]'),
  };

  const paths = data.listUiBuilderPages.map((el) => {
    const pageName = urlSlug(el.name);

    return { path: pageName, id: el.id };
  });

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['housekeeping', 'common'], i18nConfig)),
      ...(await getHamburgerProps()),
      pageData: updatedPageData,
      paths,
    },
  };
};

export default Housekeeping;
