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
import { offerDetailDrawerStatus, offerList, selectedOfferOption } from 'storage/offers.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import { isEmpty } from 'lodash';
import { useConfig } from 'utils/hooks/useConfiguration';
import { isOfferActive } from 'utils/functions';
import cx from 'classnames';
import Head from 'next/head';

export { getStaticPaths };

const Offers: React.FC = () => {
  const { t } = useTranslation(['ui-builder']);
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const locale = useLocale();
  const [selectedOfferData, setSelectedOfferData] = useState<any>();
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const offerDetailStatus: any = useReactiveVar(offerDetailDrawerStatus);
  const router = useRouter();
  const navigate = useLocalizedRouter();

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
    setSelectedOfferData(
      filteredOffersWthCategory?.filter((item: any) => item?.id === selectedOffer?.id),
    );
    offerDetailDrawerStatus(true);
  };

  const queryResultEntity = selectedOfferData ? selectedOfferData[0] : '';

  const onCtaClick = useCallback(() => {
    if (queryResultEntity?.CTA?.redirectTo === EXTERNAL_URL) {
      router.push(queryResultEntity?.CTA?.URL);
    }
    if (queryResultEntity?.CTA?.redirectTo === RESTAURANT_BOOKING_FLOW) {
      tableReservationStorage({
        restaurantName: queryResultEntity?.name,
        id: queryResultEntity?.id,
        venueId:
          (queryResultEntity?.customAttributes && queryResultEntity?.customAttributes[0]?.value) ??
          '',
      });
    }
    if (queryResultEntity?.CTA?.redirectTo !== EXTERNAL_URL) {
      const redirectUrl =
        flowPathMap[queryResultEntity?.CTA?.redirectTo.toUpperCase() as keyof typeof flowPathMap];

      if (redirectUrl) {
        navigate(redirectUrl);
      }
    }
    closeDrawer();
  }, [
    navigate,
    queryResultEntity?.CTA?.URL,
    queryResultEntity?.CTA?.redirectTo,
    queryResultEntity?.customAttributes,
    queryResultEntity?.id,
    queryResultEntity?.name,
    router,
  ]);

  const startDate = dayjs(queryResultEntity?.duration?.startDate, 'DD-MM-YYYY');
  const endDate = dayjs(queryResultEntity?.duration?.endDate, 'DD-MM-YYYY');

  const displayStartDate =
    startDate?.year() === endDate?.year()
      ? startDate.format('MMMM D')
      : startDate.format('MMMM D, YYYY');

  const displayEndDate = endDate.format('MMMM D, YYYY');

  const timeDisplayed =
    queryResultEntity &&
    !queryResultEntity?.duration.alwaysActive &&
    `${displayStartDate} until ${displayEndDate}`;

  const offerDetails = () => (
    <div className={styles.listComponent}>
      <div className={styles.imageWrapper}>
        {queryResultEntity?.images?.length > 0 &&
          (queryResultEntity?.images[0]?.ratio16to9 ? (
            <StableImage
              className={styles.bannerImage}
              src={`${ASSETS_URL}/${queryResultEntity?.images[0]?.ratio16to9}`}
            />
          ) : (
            <div className='imagePlaceHolderAnimation' />
          ))}
        {queryResultEntity?.CTA &&
          (queryResultEntity?.CTA?.redirectTo || queryResultEntity?.CTA?.URL) && (
            <StyledButton
              variant='contained'
              onClick={onCtaClick}
              className={cx(styles.button, {
                [styles.withoutImageButton]:
                  queryResultEntity && !queryResultEntity?.images[0]?.ratio16to9,
              })}
            >
              {queryResultEntity?.CTA?.ctaTitle || t('BOOK NOW')}
            </StyledButton>
          )}
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.listComponentData}>
          {queryResultEntity?.name && (
            <h2 className={styles.listComponentTitle}>{t(`${queryResultEntity?.name}`)}</h2>
          )}
        </div>
        <div className={styles.gapList}>
          {queryResultEntity?.description && (
            <>
              <p className={styles.listComponentDataTitle}>{t('Offer Includes')}</p>
              <p className={styles.listComponentDataText}>
                {t(`${queryResultEntity?.description}`)}
              </p>
            </>
          )}
          {queryResultEntity?.duration && (
            <>
              <p className={styles.listComponentDataTitle}>{t('Availability')}</p>
              <p className={styles.listComponentDataText}>
                {/* {time()} */}
                {queryResultEntity?.duration.alwaysActive ? t('EveryDay') : timeDisplayed}
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
    setSelectedOfferData('');
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
      <CustomDrawer open={offerDetailStatus} onClose={closeDrawer} content={offerDetails()} />
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
