import { useQuery, useReactiveVar } from '@apollo/client';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useCallback, useEffect, useState } from 'react';
import { tableReservationStorage } from 'storage/table-reservation.storage';
import { getStaticPaths } from 'utils/getStatic';
import styles from '../../styles/offers/offers.module.scss';
import { useRouter } from 'next/router';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import { flowPathMap } from 'utils/flowPathMap';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import { EXTERNALURL, OFFERS, RESTAURANTS_BARS, RESTAURANT_BOOKIN_FLOW } from 'utils/constants';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import dayjs from 'dayjs';
import { Notification } from 'components/shared/Notification/Notification';
import { GET_OFFERS } from 'core/graphql/queries/GET_OFFERS';
import { offerDetailDrawerStatus, offerList, selectedOfferOption } from 'storage/offers.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import { isEmpty } from 'lodash';
import { activeItems, isOfferActive } from 'utils/functions';
import cx from 'classnames';

export { getStaticPaths };

const Offers: React.FC = () => {
  const { t } = useTranslation(['ui-builder']);
  const [selectedOfferData, setSelectedOfferData] = useState<any>();
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const offerDetailStatus: any = useReactiveVar(offerDetailDrawerStatus);
  const router = useRouter();
  const navigate = useLocalizedRouter();
  const { data, loading } = useQuery(GET_OFFERS, {
    context: { clientName: 'host_v2' },
    variables: {
      lang: 'en',
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
    return restaurant.isActive && restaurant?.type === offersOptionSelected?.type;
  });

  const selectedListItem = (selectedOffer: any) => {
    setSelectedOfferData(
      filteredOffersWthCategory?.filter((item: any) => item.id === selectedOffer.id),
    );
    offerDetailDrawerStatus(true);
  };

  const queryResultEntity = selectedOfferData ? selectedOfferData[0] : '';

  const onCtaClick = useCallback(() => {
    if (queryResultEntity?.CTA?.redirectTo === EXTERNALURL) {
      router.push(queryResultEntity?.CTA?.URL);
    }
    if (queryResultEntity?.CTA?.redirectTo === RESTAURANT_BOOKIN_FLOW) {
      tableReservationStorage({
        restaurantName: queryResultEntity?.name,
        id: queryResultEntity?.id,
        venueId:
          (queryResultEntity?.customAttributes && queryResultEntity?.customAttributes[0]?.value) ??
          '',
      });
    }
    if (queryResultEntity?.CTA?.redirectTo !== EXTERNALURL) {
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

  const displayStartDate = startDate?.format('MMMM D, YYYY');
  const displayEndDate =
    startDate?.year() === endDate?.year()
      ? endDate.format('MMMM D')
      : endDate.format('MMMM D, YYYY');

  const timeDisplayed =
    queryResultEntity &&
    !queryResultEntity?.duration.alwaysActive &&
    `${displayStartDate} until ${displayEndDate}`;

  const offerDetails = () => (
    <div className={styles.listComponent}>
      <div className={styles.imageWrapper}>
        {queryResultEntity?.images ? (
          <StableImage
            className={styles.bannerImage}
            src={`${ASSETS_URL}/${queryResultEntity?.images[0]?.ratio16to9}`}
          />
        ) : (
          <div className='imagePlaceHolderAnimation' />
        )}
        {queryResultEntity?.CTA &&
          (queryResultEntity?.CTA?.redirectTo || queryResultEntity?.CTA?.URL) && (
            <StyledButton variant='contained' onClick={onCtaClick} className={styles.button}>
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
      {loading ? (
        <Loader />
      ) : (
        <>
          <Header screenTitle={t('Offers') as string} displayHome />
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
          <CustomDrawer open={offerDetailStatus} onClose={closeDrawer} content={offerDetails()} />
        </>
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
