import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useQuery, useReactiveVar } from '@apollo/client';
import styles from '@styles/hotel-compendium/hotel-compendium.module.scss';
import {
  getHotelCompendium,
  selectedCompendiumCategory,
  toggleDetailsDrawer,
} from 'storage/home.storage';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { GET_HOTEL_COMPENDIUM } from 'core/graphql/queries/GET_HOTEL_COMPENDIUM_DETIALS';
import { Loader } from 'components/shared/Loaders/Loaders';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { getStaticPaths } from 'utils/getStatic';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { useConfig } from 'utils/hooks/useConfiguration';
import { filterHotelCompendiumCategories } from 'utils/functions';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';
import { PhoneEmail } from 'components/shared/PhoneEmail/PhoneEmail';
import { EMAILCAPS, PHONECAPS, URL } from 'utils/constants';
import NoInformation from 'components/shared/NoInformation/NoInformation';

export { getStaticPaths };

const HotelCompendium: React.FC = () => {
  const { t } = useTranslation('common');
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const [showSelectedAmenity, setShowSelectedAmenity] = useState<any>();
  const hotelCompendiumSelectedDetails: any = useReactiveVar(selectedCompendiumCategory);
  const detailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const { data, loading } = useQuery(GET_HOTEL_COMPENDIUM, {
    skip: !hotelId,
    context: { clientName: 'property_a' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  useEffect(() => {
    if (data && hotelCompendiumSelectedDetails?.length === 0) {
      const filteredDetails = filterHotelCompendiumCategories(data);
      selectedCompendiumCategory(filteredDetails[0]);
      getHotelCompendium(data?.getHotelAmenityDetails);
    }
  }, [data, hotelCompendiumSelectedDetails]);

  const selectedAmenities = data?.getHotelAmenityDetails?.amenities?.filter(
    (amenity: any) =>
      amenity?.categoryIds?.length > 0 &&
      amenity?.categoryIds?.includes(hotelCompendiumSelectedDetails?.id) &&
      amenity?.isActive,
  );

  const selectedListItem = (data: any) => {
    setShowSelectedAmenity(data);
    toggleDetailsDrawer(true);
  };

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    setShowSelectedAmenity('');
  };

  const hotelCompendiumDrawerDetails = () => (
    <>
      {showSelectedAmenity && (
        <>
          {showSelectedAmenity?.images?.length > 0 && (
            <CustomCarousel imageData={showSelectedAmenity} />
          )}
          <div className={styles.wrapper}>
            {showSelectedAmenity?.name && (
              <p className={styles.title}>{showSelectedAmenity?.name}</p>
            )}
            {showSelectedAmenity?.description && (
              <p className={styles.description}>{showSelectedAmenity?.description}</p>
            )}
            {showSelectedAmenity?.highlights[0] && (
              <p className={styles.highlights}>{showSelectedAmenity?.highlights[0]}</p>
            )}

            {showSelectedAmenity?.information?.some(
              (e: any) => e?.type === PHONECAPS || e?.type === EMAILCAPS || e?.type === URL,
            ) && (
              <PhoneEmail
                phone={
                  showSelectedAmenity?.information?.find((e: any) => e?.type === PHONECAPS)?.value
                }
                email={
                  showSelectedAmenity?.information?.find((e: any) => e?.type === EMAILCAPS)?.value
                }
                url={showSelectedAmenity?.information?.find((e: any) => e?.type === URL)?.value}
                phoneTitle={
                  showSelectedAmenity?.information?.find((e: any) => e?.type === PHONECAPS)?.field
                }
                emailTitle={
                  showSelectedAmenity?.information?.find((e: any) => e?.type === EMAILCAPS)?.field
                }
                urlTitle={
                  showSelectedAmenity?.information?.find((e: any) => e?.type === URL)?.field
                }
                phoneDisplayTitle={
                  showSelectedAmenity?.information?.find((e: any) => e?.type === PHONECAPS)
                    ?.displayTitle
                }
                emailDisplayTitle={
                  showSelectedAmenity?.information?.find((e: any) => e?.type === EMAILCAPS)
                    ?.displayTitle
                }
                urlDisplayTitle={
                  showSelectedAmenity?.information?.find((e: any) => e?.type === URL)?.displayTitle
                }
              />
            )}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Things To Do')}
        </title>
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
              <NoInformation
                message={t(
                  'At the moment, there are no activities available. Please check back later. We appreciate your understanding.',
                )}
              />
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
        ['errors', 'hotel-compendium', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default HotelCompendium;
