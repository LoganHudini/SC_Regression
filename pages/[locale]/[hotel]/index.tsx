import { useQuery } from '@apollo/client';
import { DiningCarousel } from 'components/pages/home/DiningCarousel/DiningCarousel';
import { HotelCompendiumContainer } from 'components/pages/home/HotelCompendium/HotelCompendium';
import { ServiceRequestCarousel } from 'components/pages/home/ServiceRequestCarousel/ServiceRequestCarousel';
import { SpaCarousel } from 'components/pages/home/SpaCarousel/SpaCarousel';
import { OffersCarousel } from 'components/pages/home/OffersCarousel/OffersCarousel';
import { Header } from 'components/shared/Header/Header';
import { Loader, LogoLoader } from 'components/shared/Loaders/Loaders';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { BRAND_CODE } from 'core/graphql/endpoints';
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
import {
  CHECK_IN,
  FAIRMONT,
  IN_ROOM_DINING,
  PAIR_TO_ROOM,
  RAFFLES,
  SERVICES,
} from 'utils/constants';
import { activeModule, isOfferActive } from 'utils/functions';
import { getStaticPaths } from 'utils/getStatic';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { Checkin } from 'components/pages/home/Checkin/Checkin';
import React from 'react';
import { HotelInfoCarousel } from 'components/pages/home/HotelInfoCarousel/HotelInfoCarousel';

export { getStaticPaths };

const Home: NextPage = () => {
  const { t } = useTranslation(['common']);
  const locale = useLocale();
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotelName = config?.name;

  const checkInModule = activeModule(config?.modules, CHECK_IN);
  const pairToRoomModule: boolean = activeModule(config?.modules, PAIR_TO_ROOM);
  const irdModule: any = activeModule(config?.modules, IN_ROOM_DINING);
  const serviceModule: any = activeModule(config?.modules, SERVICES);

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

  const activeOffersList = offersList?.getOffersDetails?.filter((item: any) => isOfferActive(item));

  const homeModules: any = {
    'hotel-info': () => (
      <>
        {homeCarouselDetails?.getPropertyDetailsByHotelId?.hotel?.images?.length > 0 && (
          <HotelInfoCarousel data={homeCarouselDetails?.getPropertyDetailsByHotelId?.hotel} />
        )}
      </>
    ),
    offers: () => (
      <>
        {activeOffersList?.length > 0 && (
          <OffersCarousel data={activeOffersList} loading={offersListLoading} />
        )}
      </>
    ),
    services: () => (
      <>
        {checkInData?.checkedIn && serviceModule && (
          <ServiceRequestCarousel data={serviceCarouselDetails} loading={serviceCarouselLoading} />
        )}
      </>
    ),
    'check-in': () => (
      <>
        {!checkInData?.checkedIn && checkInModule && (
          <Checkin
            title={t('Check-in?')}
            description={t(
              'To begin your check-in process, please tap the ‘Check-In’ button below',
            )}
            buttonTitle={t('Check-In Now')}
          />
        )}
        {!checkInData?.checkedIn && pairToRoomModule && (
          <Checkin
            title={t('Checked in already?')}
            description={t(
              'To pair your device with your room, please press the ‘Connect to Room’ button below. This will enable you to access in-room services conveniently from your device. Enjoy your stay with us!',
            )}
            buttonTitle={t('Connect to Room')}
          />
        )}
      </>
    ),
    dining: () => (
      <>
        <DiningCarousel
          ird={irdMenu}
          restaurants={restaurantList}
          loading={irdloading || restaurantloading}
          irdModule={irdModule}
        />
      </>
    ),
    spa: () => (
      <>
        <SpaCarousel data={spaList} loading={spaloading} />
      </>
    ),
    'hotel-compendium': () => (
      <>
        <HotelCompendiumContainer data={hotelCompendiumList} loading={hotelCompendiumloading} />
      </>
    ),
  };

  return (
    <>
      <Head>
        <title>{hotelName}</title>
      </Head>
      {(BRAND_CODE === FAIRMONT || BRAND_CODE == RAFFLES) && (
        <Header screenTitle={t('Home') as string} />
      )}

      <PageWrapper displayBottomMenu className={'globals-landingPageContainer'}>
        {homeCarouselLoading ||
        serviceCarouselLoading ||
        irdloading ||
        restaurantloading ||
        spaloading ||
        offersListLoading ? (
          config?.isLogoLoaderActive === false ? (
            <Loader />
          ) : (
            <LogoLoader />
          )
        ) : (
          config?.orderOfModules?.map((moduleCode: any, index: number) => {
            return (
              <React.Fragment key={moduleCode || index}>
                {homeModules[moduleCode]?.()}
              </React.Fragment>
            );
          })
        )}
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
