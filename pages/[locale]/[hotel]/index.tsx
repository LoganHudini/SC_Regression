import { useQuery } from '@apollo/client';
import { DiningCarousel } from 'components/pages/home/DiningCarousel/DiningCarousel';
import { HomeCarousel } from 'components/pages/home/HomeCarousel/HomeCarousel';
import { HotelCompendiumContainer } from 'components/pages/home/HotelCompendium/HotelCompendium';
import HotelInformation from 'components/pages/home/HotelInformation/HotelInformation';
import { ServiceRequestCarousel } from 'components/pages/home/ServiceRequestCarousel/ServiceRequestCarousel';
import { SpaCarousel } from 'components/pages/home/SpaCarousel/SpaCarousel';
import { LogoLoader } from 'components/shared/Loaders/Loaders';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GET_HOTEL_COMPENDIUM } from 'core/graphql/queries/GET_HOTEL_COMPENDIUM_DETIALS';
import { GET_HOTEL_INFORMATION } from 'core/graphql/queries/GET_HOTEL_INFORMATION';
import {
  GET_HOUSEKEEPING,
  IGetHousekeepingApiResponse,
} from 'core/graphql/queries/GET_HOUSEKEEPING';
import { GET_OFFERS } from 'core/graphql/queries/GET_OFFERS';
import {
  GET_RESTAURANT_DETAILS,
  IGetRestaurantDetailsResponse,
} from 'core/graphql/queries/GET_RESTAURTANT_DETAILS';
import { GET_SPA_DETAILS } from 'core/graphql/queries/GET_SPA_DETAILS';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useCheckedIn } from 'storage/check-in.storage';
import { getStaticPaths } from 'utils/getStatic';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale } from 'utils/hooks/useLocalizedRouter';

export { getStaticPaths };

const Home: NextPage = () => {
  const { t } = useTranslation('common');
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;

  const checkInData = useCheckedIn();

  const { data: homeCarouselDetails, loading: homeCarouselLoading } = useQuery(
    GET_HOTEL_INFORMATION,
    {
      skip: !hotelId,
      context: { clientName: 'host_v0' },
      fetchPolicy: 'no-cache',
      variables: {
        hotelId: hotelId,
        lang: locale === 'en' ? '' : locale,
      },
    },
  );

  const { data: serviceCarouselDetails, loading: serviceCarouselLoading } =
    useQuery<IGetHousekeepingApiResponse>(GET_HOUSEKEEPING, {
      skip: !hotelId,
      context: { clientName: 'host_v1' },
      variables: {
        lang: locale === 'en' ? '' : locale,
        hotelId: hotelId,
      },
    });

  const { data: irdMenu, loading: irdloading } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    skip: !hotelId,
    context: { clientName: 'host_v2' },
    variables: {
      hotelId: hotelId,
      restaurantId: '',
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const { data: restaurantList, loading: restaurantloading } =
    useQuery<IGetRestaurantDetailsResponse>(GET_RESTAURANT_DETAILS, {
      skip: !hotelId,
      context: { clientName: 'host_v0' },
      fetchPolicy: 'no-cache',
      variables: {
        lang: locale === 'en' ? '' : locale,
        hotelId: hotelId,
      },
    });

  const { data: spaList, loading: spaloading } = useQuery(GET_SPA_DETAILS, {
    skip: !hotelId,
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
    variables: {
      lang: locale === 'en' ? '' : locale,
      hotelId: hotelId,
    },
  });

  const { data: hotelCompendiumList, loading: hotelCompendiumloading } = useQuery(
    GET_HOTEL_COMPENDIUM,
    {
      skip: !hotelId,
      context: { clientName: 'host_v0' },
      fetchPolicy: 'no-cache',
      variables: {
        lang: locale === 'en' ? '' : locale,
        hotelId: hotelId,
      },
    },
  );

  const { data: offersList, loading: offersListLoading } = useQuery(GET_OFFERS, {
    skip: !hotelId,
    context: { clientName: 'host_v2' },
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  return (
    <>
      <Head>
        <title>{hotelName}</title>
      </Head>
      <PageWrapper displayBottomMenu>
        {(homeCarouselLoading ||
          serviceCarouselLoading ||
          irdloading ||
          restaurantloading ||
          spaloading ||
          offersListLoading) && <LogoLoader />}
        <HomeCarousel data={offersList} />
        {!checkInData?.checkedIn && (
          <HotelInformation details={homeCarouselDetails} loading={homeCarouselLoading} />
        )}
        {checkInData?.checkedIn && (
          <ServiceRequestCarousel data={serviceCarouselDetails} loading={serviceCarouselLoading} />
        )}
        <DiningCarousel
          ird={irdMenu}
          restaurants={restaurantList}
          loading={irdloading || restaurantloading}
        />
        <SpaCarousel data={spaList} loading={spaloading} />
        <HotelCompendiumContainer data={hotelCompendiumList} loading={hotelCompendiumloading} />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'], i18nConfig)),
    },
  };
};

export default Home;
