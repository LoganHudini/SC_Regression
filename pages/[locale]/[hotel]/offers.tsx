import { useQuery, useReactiveVar } from '@apollo/client';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useCallback, useEffect, useState } from 'react';
import { getStaticPaths } from 'utils/getStatic';
import styles from '@styles/offers/offers.module.scss';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import { OFFERS } from 'utils/constants';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
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
import Head from 'next/head';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import {
  offerDetails,
  handleCtaClick,
  timeDisplayed,
} from 'components/pages/home/OffersCarousel/OffersCarousel';

export { getStaticPaths };

const Offers: React.FC = () => {
  const { t } = useTranslation(['offers', 'common']);
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const locale = useLocale();
  const offersOptionSelected: any = useReactiveVar(selectedOfferOption);
  const offerDetailStatus: any = useReactiveVar(offerDetailDrawerStatus);
  const selectedOffer: any = useReactiveVar(selectedOfferDetails);
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
    handleCtaClick(selectedOffer, setofferBooking, navigate, closeDrawer);
  }, [navigate, selectedOffer]);

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
        <CustomDrawer
          open={offerDetailStatus}
          onClose={closeDrawer}
          content={offerDetails(selectedOffer, timeDisplayed, onCtaClick, t)}
        />
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
