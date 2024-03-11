import { useQuery, useReactiveVar } from '@apollo/client';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useCallback, useEffect, useState } from 'react';
import { tableReservationStorage } from 'storage/table-reservation.storage';
import { getStaticPaths } from 'utils/getStatic';
import styles from '@styles/offers/offers.module.scss';
import { useRouter } from 'next/router';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import { flowPathMap } from 'utils/flowPathMap';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import { EXTERNAL_URL, OFFERS, RESTAURANTS_BARS, RESTAURANT_BOOKING_FLOW } from 'utils/constants';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import dayjs from 'dayjs';
import { Notification } from 'components/shared/Notification/Notification';
import { GET_OFFERS } from 'core/graphql/queries/GET_OFFERS';
import {
  offerDetailDrawerStatus,
  offerList,
  selectedOfferDetails,
  selectedOfferOption,
} from 'storage/offers.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import { isEmpty } from 'lodash';
import { useConfig } from 'utils/hooks/useConfiguration';
import { isOfferActive } from 'utils/functions';
import cx from 'classnames';
import Head from 'next/head';
import { PlaceholderImage } from 'components/shared/PlaceholderImage/PlaceholderImage';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';

export { getStaticPaths };

const Offers: React.FC = () => {
  const { t } = useTranslation(['offers', 'common']);
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const locale = useLocale();
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const offerDetailStatus: any = useReactiveVar(offerDetailDrawerStatus);
  const selectedOffer: any = useReactiveVar(selectedOfferDetails);

  const router = useRouter();
  const navigate = useLocalizedRouter();
  const [offerBooking, setofferBooking] = useState(false);

  const { data, loading } = useQuery(GET_OFFERS, {
    skip: !hotelId,
    context: { clientName: 'host_v2' },
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const offersData = data?.getOffersDetails;
  const filteredOffers = offersData?.filter((item: any) => isOfferActive(item));

  useEffect(() => {
    if (filteredOffers) {
      offerList(filteredOffers);
    }
  }, [data, filteredOffers]);

  useEffect(() => {
    if (isEmpty(offersOptionSelected)) {
      selectedOfferOption(filteredOffers && filteredOffers[0]);
    }
  }, [filteredOffers, offersOptionSelected]);

  const filteredOffersWthCategory = filteredOffers?.filter((restaurant: any) => {
    return restaurant?.isActive && restaurant?.type === offersOptionSelected?.type;
  });

  const selectedListItem = (selectedOffer: any) => {
    selectedOfferDetails(
      filteredOffersWthCategory?.find((item: any) => item?.id === selectedOffer?.id),
    );
    offerDetailDrawerStatus(true);
  };

  const onCtaClick = useCallback(() => {
    if (selectedOffer?.CTA?.redirectTo === EXTERNAL_URL) {
      setofferBooking(true);
    }
    if (selectedOffer?.CTA?.redirectTo === RESTAURANT_BOOKING_FLOW) {
      tableReservationStorage({
        restaurantName: selectedOffer?.name,
        id: selectedOffer?.id,
        venueId:
          (selectedOffer?.customAttributes && selectedOffer?.customAttributes[0]?.value) ?? '',
      });
    }
    if (selectedOffer?.CTA?.redirectTo !== EXTERNAL_URL) {
      const redirectUrl =
        flowPathMap[selectedOffer?.CTA?.redirectTo.toUpperCase() as keyof typeof flowPathMap];

      if (redirectUrl) {
        navigate(redirectUrl);
      }
    }
    closeDrawer();
  }, [
    navigate,
    selectedOffer?.CTA?.redirectTo,
    selectedOffer?.customAttributes,
    selectedOffer?.id,
    selectedOffer?.name,
  ]);

  const startDate = dayjs(selectedOffer?.duration?.startDate, 'DD-MM-YYYY');
  const endDate = dayjs(selectedOffer?.duration?.endDate, 'DD-MM-YYYY');

  const displayStartDate =
    startDate?.year() === endDate?.year()
      ? startDate.format('MMMM D')
      : startDate.format('MMMM D, YYYY');

  const displayEndDate = endDate.format('MMMM D, YYYY');

  const timeDisplayed =
    selectedOffer &&
    !selectedOffer?.duration?.alwaysActive &&
    `${displayStartDate} until ${displayEndDate}`;

  const offerDetails = () => (
    <div className={styles.listComponent}>
      <div className={styles.imageWrapper}>
        {selectedOffer?.images?.length > 0 ? (
          <StableImage
            className={styles.bannerImage}
            src={`${ASSETS_URL}/${selectedOffer?.images[0]?.ratio16to9}`}
          />
        ) : (
          <PlaceholderImage />
        )}
        {selectedOffer?.CTA && (selectedOffer?.CTA?.redirectTo || selectedOffer?.CTA?.URL) && (
          <StyledButton
            variant='contained'
            onClick={onCtaClick}
            className={cx(styles.button, {
              [styles.withoutImageButton]: selectedOffer && !selectedOffer?.images[0]?.ratio16to9,
            })}
          >
            {selectedOffer?.CTA?.ctaTitle || t('BOOK NOW')}
          </StyledButton>
        )}
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.listComponentData}>
          {selectedOffer?.name && (
            <h2 className={styles.listComponentTitle}>{t(`${selectedOffer?.name}`)}</h2>
          )}
        </div>
        <div className={styles.gapList}>
          {selectedOffer?.description && (
            <>
              <p className={styles.listComponentDataTitle}>{t('Offer Includes')}</p>
              <p className={styles.listComponentDataText}>{t(`${selectedOffer?.description}`)}</p>
            </>
          )}
          {selectedOffer?.duration && (
            <>
              <p className={styles.listComponentDataTitle}>{t('Availability')}</p>
              <p className={styles.listComponentDataText}>
                {/* {time()} */}
                {selectedOffer?.duration?.alwaysActive ? t('EveryDay') : timeDisplayed}
              </p>
            </>
          )}
        </div>
      </div>
      <>
        <Notification
          title={t('Thank You!') as string}
          description={
            t(
              'Your booking has been received. Our reservation team will get in touch with you soon',
            ) as string
          }
          redirect={RESTAURANTS_BARS}
          type='success'
        />
      </>
    </div>
  );

  const closeDrawer = () => {
    offerDetailDrawerStatus(false);
    selectedOfferDetails('');
  };

  const closeofferBooking = () => {
    setofferBooking(false);
  };

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Offers')}
        </title>
      </Head>
      <Header screenTitle={t('Offers') as string} displayHome />
      {loading ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper} displayBottomMenu>
          {filteredOffersWthCategory?.map((queryResultEntity: any) => (
            <ListComponentEntity
              key={queryResultEntity.id}
              queryResultEntity={queryResultEntity}
              selectedListItem={selectedListItem}
              module={OFFERS}
            />
          ))}
        </PageWrapper>
      )}
      {/* <CustomDrawer open={offerDetailStatus} onClose={closeDrawer} content={offerDetails()} /> */}
      {offerBooking ? (
        <CustomDrawer
          open={offerBooking}
          onClose={closeofferBooking}
          content={
            <IframeComponent
              src={selectedOffer?.CTA?.URL}
              handledrawerState={setofferBooking}
              name={OFFERS}
            />
          }
          isIframe={true}
        />
      ) : (
        <CustomDrawer open={offerDetailStatus} onClose={closeDrawer} content={offerDetails()} />
      )}
    </>
  );
};
export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['offers', 'common'], i18nConfig)),
    },
  };
};
export default Offers;
