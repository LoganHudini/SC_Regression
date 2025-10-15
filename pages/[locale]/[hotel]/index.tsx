import { useQuery } from '@apollo/client';
import { DiningCarousel } from 'components/pages/home/DiningCarousel/DiningCarousel';
import { HotelCompendiumContainer } from 'components/pages/home/HotelCompendium/HotelCompendium';
import { ServiceRequestCarousel } from 'components/pages/home/ServiceRequestCarousel/ServiceRequestCarousel';
import { SpaCarousel } from 'components/pages/home/SpaCarousel/SpaCarousel';
import { Header } from 'components/shared/Header/Header';
import { Loader, LogoLoader } from 'components/shared/Loaders/Loaders';
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
import { CHECK_IN, PAIR_TO_ROOM, SERVICES } from 'utils/constants';
import { activeModule, isOfferActive } from 'utils/functions';
import { getStaticPaths } from 'utils/getStatic';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { Checkin } from 'components/pages/home/Checkin/Checkin';
import React from 'react';
import HotelInformation from 'components/pages/home/HotelInformation/HotelInformation';
import { HomeCarousel } from 'components/pages/home/HomeCarousel/HomeCarousel';
import { irdMenuOutputDetailsStorage } from 'storage/dining.storage';
import { StayDetails } from 'components/pages/home/stayDetails/stayDetails';
import { ActivityCarousel } from 'components/pages/home/ActivityCarousel/ActivityCarousel';
import { GET_ACTIVITIES, IGetActivitiesApiResponse } from 'core/graphql/queries/GET_ACTIVITY';
import { GET_LOCATIONS, IGetLocationsApiResponse } from 'core/graphql/queries/GET_LOCATIONS';
import { hotelLocation } from 'storage/home.storage';
import { isEmpty } from 'lodash';

export { getStaticPaths };

const Home: NextPage = () => {
  const { t } = useTranslation(['common']);
  const locale = useLocale();
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotelName = config?.name;
  const checkInModule = activeModule(config?.modules, CHECK_IN);
  const pairToRoomModule: boolean = activeModule(config?.modules, PAIR_TO_ROOM);
  const serviceModule: any = activeModule(config?.modules, SERVICES);

  const checkInData = useCheckedIn();

  const { data: homeCarouselDetails, loading: homeCarouselLoading } = useQuery(
    GET_HOTEL_INFORMATION,
    {
      skip: isEmpty(config),
      context: { clientName: 'property_a' },
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
      context: { clientName: 'property_b' },
      variables: {
        lang: locale === 'en' ? '' : locale,
        hotelId: hotelId,
      },
    });

  const { data: irdMenu, loading: irdloading } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    skip: !hotelId,
    context: { clientName: 'property_c' },
    variables: {
      hotelId: hotelId,
      restaurantId: '',
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      irdMenuOutputDetailsStorage(data);
    },
  });

  const { data: restaurantList, loading: restaurantloading } =
    useQuery<IGetRestaurantDetailsResponse>(GET_RESTAURANT_DETAILS, {
      skip: !hotelId,
      context: { clientName: 'property_a' },
      fetchPolicy: 'no-cache',
      variables: {
        lang: locale === 'en' ? '' : locale,
        hotelId: hotelId,
      },
    });

  const { data: spaList, loading: spaloading } = useQuery(GET_SPA_DETAILS, {
    skip: !hotelId,
    context: { clientName: 'property_a' },
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
      context: { clientName: 'property_a' },
      fetchPolicy: 'no-cache',
      variables: {
        lang: locale === 'en' ? '' : locale,
        hotelId: hotelId,
      },
    },
  );

  const { data: offersList, loading: offersListLoading } = useQuery(GET_OFFERS, {
    skip: !hotelId,
    context: { clientName: 'property_c' },
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const { data: activitiesData, loading: activitiesLoading } = useQuery<IGetActivitiesApiResponse>(
    GET_ACTIVITIES,
    {
      context: { clientName: 'property_f' },
      variables: {
        hotelId: hotelId,
        id: '',
        startDate: '',
        endDate: '',
        categoryId: '',
        availability: '',
        priceType: '',
        location: '',
        limit: 0,
        pageToken: '',
        lang: locale === 'en' ? '' : locale,
      },
      fetchPolicy: 'no-cache',
      skip: !hotelId,
    },
  );

  const { data: location, loading: locationLoading } = useQuery<IGetLocationsApiResponse>(
    GET_LOCATIONS,
    {
      fetchPolicy: 'no-cache',
      context: { clientName: 'property_d' },
      variables: {
        hotelId: hotelId,
        lang: locale === 'en' ? '' : locale,
      },
      skip: !hotelId,
    },
  );

  hotelLocation(location?.getLocations);

  const activitiesList = activitiesData?.getActivitiesV2?.activities || [];

  const activeOffersList = offersList?.getOffersDetails?.filter((item: any) => isOfferActive(item));

  const homeModules: any = {
    'hotel-info': () => (
      <>
        {homeCarouselDetails && !checkInData?.checkedIn && (
          <HotelInformation details={homeCarouselDetails} loading={homeCarouselLoading} />
        )}
      </>
    ),
    offers: () => {
      const showTitle = config?.orderOfModules?.[0] !== 'offers';
      return (
        <>
          {activeOffersList?.length > 0 && (
            <div>
              {showTitle && (
                <h2
                  style={{
                    margin: '10px 0 8px',
                    font: '1.75rem var(--heading-font-regular)',
                    textAlign: 'center',
                  }}
                >
                  Offers
                </h2>
              )}
              <HomeCarousel data={activeOffersList} />
            </div>
          )}
        </>
      );
    },
    services: () => (
      <>
        {checkInData?.checkedIn && serviceModule && (
          <ServiceRequestCarousel data={serviceCarouselDetails} loading={serviceCarouselLoading} />
        )}
      </>
    ),
    'check-in': () => (
      <>
        {!checkInData?.checkedIn &&
          checkInModule &&
          !config?.preCheckInOnly &&
          !config.disableCheckinCard && (
            <Checkin
              title={t('Check-in?')}
              description={t(
                'To begin your check-in process, please tap the ‘Check-In’ button below',
              )}
              buttonTitle={t('Check-In Now')}
            />
          )}
        {(config?.nativeAppRedirection?.isActive ? true : !checkInData?.checkedIn) &&
          pairToRoomModule && (
            <Checkin
              title={t('Checked in already?')}
              description={t(
                'To pair your device with your room, please press the ‘Connect to Room’ button below. This will enable you to access in-room services conveniently from your device. Enjoy your stay with us!',
              )}
              buttonTitle={t('Connect to Room')}
              downloadText={
                config?.nativeAppRedirection?.isActive
                  ? (t(
                      'Elevate your stay with our exclusive app. Unlock your room, view your bill, control in-room settings, and stay updated on hotel events—all from your phone. \n\nDownload now to transform your stay into an unforgettable experience!',
                    ) as string)
                  : null
              }
            />
          )}
      </>
    ),
    staydetails: () =>
      activeModule(config?.modules, 'activities-and-itineraries') ? (
        <StayDetails activeOffersList={activeOffersList} />
      ) : null,
    activities: () =>
      activeModule(config?.modules, 'activities-and-itineraries') ? (
        <ActivityCarousel data={activitiesList} />
      ) : null,
    dining: () => (
      <>
        <DiningCarousel
          ird={irdMenu}
          restaurants={restaurantList}
          loading={irdloading || restaurantloading}
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
      {config?.homePageHeader && <Header screenTitle={t('Home') as string} />}
      <PageWrapper displayBottomMenu homePageHeader={config?.homePageHeader}>
        {homeCarouselLoading ||
        serviceCarouselLoading ||
        irdloading ||
        restaurantloading ||
        spaloading ||
        activitiesLoading ||
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
      ...(await serverSideTranslations(
        locale as string,
        ['errors', 'common', 'restaurants'],
        i18nConfig,
      )),
    },
  };
};

export default Home;
