import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useQuery, useReactiveVar } from '@apollo/client';
import styles from '../../styles/hotel-compendium/hotel-compendium.module.scss';
import {
  getHotelCompendium,
  selectedCompendiumCategory,
  toggleDetailsDrawer,
} from 'storage/home.storage';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { GET_HOTEL_COMPENDIUM } from 'core/graphql/queries/GET_HOTEL_COMPENDIUM_DETIALS';
import { Loader } from 'components/shared/Loaders/Loaders';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { getStaticPaths } from 'utils/getStatic';

export { getStaticPaths };

const HotelCompendium = () => {
  const { t } = useTranslation('common');
  const [showSelectedAmenity, setShowSelectedAmenity] = useState<any>();
  const hotelCompendiumSelectedDetails: any = useReactiveVar(selectedCompendiumCategory);
  const detailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const { data, loading } = useQuery(GET_HOTEL_COMPENDIUM, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (data && hotelCompendiumSelectedDetails?.length === 0) {
      const filteredDetails = data?.getHotelAmenityDetails?.categories?.filter((category: any) => {
        return data?.getHotelAmenityDetails?.amenities?.find(
          (amenity: any) => category?.id === amenity?.categoryIds[0] && amenity?.isActive,
        );
      });
      selectedCompendiumCategory(filteredDetails[0]);
      getHotelCompendium(data?.getHotelAmenityDetails);
    }
  }, [data, hotelCompendiumSelectedDetails]);

  const selectedAmenities = data?.getHotelAmenityDetails?.amenities?.filter(
    (amenity: any) =>
      amenity?.categoryIds?.length > 0 &&
      amenity?.categoryIds[0] === hotelCompendiumSelectedDetails?.id &&
      amenity?.isActive,
  );

  const selectedListItem = (data: any) => {
    setShowSelectedAmenity(data);
    toggleDetailsDrawer(true);
  };

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
  };

  const hotelCompendiumDrawerDetails = () => (
    <>
      <StableImage
        className={styles.image}
        src={`${ASSETS_URL}/${showSelectedAmenity?.images[0]?.ratio16to9}`}
      />
      <div className={styles.wrapper}>
        {showSelectedAmenity?.name && (
          <div className={styles.title}>{showSelectedAmenity?.name}</div>
        )}
        {showSelectedAmenity?.description && (
          <div className={styles.description}>{showSelectedAmenity?.description}</div>
        )}
        {showSelectedAmenity?.highlights[0] && (
          <div className={styles.highlights}>{showSelectedAmenity?.highlights[0]}</div>
        )}
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>{t('Things To Do')}</title>
      </Head>
      <Header displayHome screenTitle={t('Things To Do') as string} />
      {loading ? (
        <Loader />
      ) : (
        <PageWrapper displayBottomMenu className={styles.pageWrapper}>
          <>
            {selectedAmenities?.length > 0 ? (
              selectedAmenities?.map((amenity: any) => (
                <div key={amenity?.name}>
                  <ListComponentEntity
                    queryResultEntity={amenity}
                    selectedListItem={selectedListItem}
                  />
                </div>
              ))
            ) : (
              <div className={styles.info}>{t('No information found')}</div>
            )}
            <CustomDrawer
              open={detailsDrawerStatus}
              onClose={closeDrawer}
              content={hotelCompendiumDrawerDetails()}
            />
          </>
        </PageWrapper>
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
        ['hotel-compendium', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default HotelCompendium;
