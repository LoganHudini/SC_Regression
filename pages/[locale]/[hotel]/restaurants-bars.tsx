import { useQuery, useReactiveVar } from '@apollo/client';
import {
  GET_RESTAURANT_DETAILS,
  IGetRestaurantDetailsResponse,
} from 'core/graphql/queries/GET_RESTAURTANT_DETAILS';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';
import {
  restaurantListStorage,
  selectedRestaurantStorage,
} from 'storage/table-reservation.storage';
import { getStaticPaths } from 'utils/getStatic';
import styles from '@styles/restaurants-bars/restaurants-bars.module.scss';
import { useCheckedIn } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import { diningOptions, diningHeaders, toggleDetailsDrawer } from 'storage/home.storage';
import { IN_ROOM_DINING } from 'utils/constants';
import { activeItems, activeModule, uniqueDiningOption } from 'utils/functions';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import Head from 'next/head';
import { Loader } from 'components/shared/Loaders/Loaders';
import { isEmpty } from 'lodash';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { RestaurantDetail } from 'components/pages/dining/RestaurantDetail/RestaurantDetail';
import NoInformation from 'components/shared/NoInformation/NoInformation';
import { useBackwardNavigation } from 'utils/hooks/useBackwardNavigation';

export { getStaticPaths };

const RestaurantAndBars: React.FC = () => {
  const { t } = useTranslation(['restaurants', 'common']);
  const isCheckedIn = useCheckedIn();
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const config = useConfig();
  const restaurantDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const initialSelected = useReactiveVar(selectedRestaurantStorage);
  const [selectedRestaurantData, setSelectedRestaurantData] = useState<any>();
  const irdModule: any = activeModule(config?.modules, IN_ROOM_DINING);

  const { data, loading } = useQuery<IGetRestaurantDetailsResponse>(GET_RESTAURANT_DETAILS, {
    skip: !hotelId,
    context: { clientName: 'property_a' },
    fetchPolicy: 'no-cache',
    variables: {
      lang: locale === 'en' ? '' : locale,
      hotelId: hotelId,
    },
  });

  const diningOptionSelected = useReactiveVar(diningOptions);

  const queryResultsData: any = data?.getRestaurantDetails?.restaurant;
  restaurantListStorage(queryResultsData?.map((item: any) => ({ id: item?.id, name: item?.name })));

  const selectedListItem = (item: any) => {
    setSelectedRestaurantData(item);
    toggleDetailsDrawer(true);
  };

  useEffect(() => {
    queryResultsData?.length !== 0 && diningOptions(data?.getRestaurantDetails?.restaurant[0]);
    if (!isEmpty(initialSelected)) {
      diningOptions(initialSelected);
      setSelectedRestaurantData(initialSelected);
      setTimeout(() => {
        toggleDetailsDrawer(true);
      }, 1000);
    }
  }, [queryResultsData]);

  const filteredList = activeItems(queryResultsData);
  const uniqueFilteredDiningOptions = uniqueDiningOption(queryResultsData);

  useEffect(() => {
    if (uniqueFilteredDiningOptions?.length > 0) {
      diningHeaders(
        isCheckedIn?.checkedIn && irdModule
          ? [...uniqueFilteredDiningOptions, { type: IN_ROOM_DINING }]
          : uniqueFilteredDiningOptions,
      );
    }
  }, [queryResultsData]);

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    setSelectedRestaurantData('');
  };

  useBackwardNavigation(restaurantDetailsDrawerStatus, closeDrawer);

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Restaurants & Bars') as string}
        </title>
      </Head>
      <Header screenTitle={t('Restaurants & Bars') as string} displayHome />
      {loading ? (
        <Loader />
      ) : (
        <>
          <PageWrapper
            className={styles.pageWrapper}
            displayBottomMenu={filteredList?.length > 0 ? true : false}
          >
            <div>
              {filteredList?.length > 0 ? (
                filteredList?.map((queryResultEntity: any) => (
                  <ListComponentEntity
                    key={queryResultEntity?.id}
                    queryResultEntity={queryResultEntity}
                    selectedListItem={selectedListItem}
                  />
                ))
              ) : (
                <NoInformation
                  message={t(
                    'At the moment, there are no restaurants available. Please check back later. We appreciate your understanding.',
                  )}
                />
              )}
            </div>
          </PageWrapper>
          <CustomDrawer
            open={restaurantDetailsDrawerStatus}
            onClose={closeDrawer}
            content={<RestaurantDetail selectedRestaurant={selectedRestaurantData} />}
          />
        </>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['errors', 'restaurants', 'common'],
        i18nConfig,
      )),
    },
  };
};
export default RestaurantAndBars;
