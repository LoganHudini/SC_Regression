import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { HousekeepingItem } from 'components/pages/housekeeping/HousekeepingItem/HousekeepingItem';
import { Header } from 'components/shared/Header/Header';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import styles from '../../styles/housekeeping/housekeeping.module.scss';
import urlSlug from 'url-slug';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { HousekeepingConfirm } from 'components/pages/housekeeping/HousekeepingConfirm/HousekeepingConfirm';
import {
  GET_HOUSEKEEPING,
  IGetHousekeepingApiResponse,
} from 'core/graphql/queries/GET_HOUSEKEEPING';
import { IHamburgerProps, getHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { useQuery, useReactiveVar } from '@apollo/client';
import { housekeepingOptions, housekeepingStorage } from 'storage/housekeeping.storage';
import { HousekeepingItemSkeleton } from 'components/pages/housekeeping/HousekeepingItemSkeleton/HousekeepingItemSkeleton';
import { HousekeepingRequestModal } from 'components/pages/housekeeping/HousekeepingRequestModal/HousekeepingRequestModal';
import { client } from 'core/graphql/client';
import {
  IGetHotelInfoApiResponse,
  GET_HOTEL_INFO,
  IHotelPage,
  IParsedHotelPage,
} from 'core/graphql/queries/GET_HOTEL_INFO';
import { IHousekeepingProps } from 'types/housekeeping.types';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { HousekeepingDrawer } from 'components/pages/housekeeping/HousekeepingDrawer/HousekeepingDrawer';

export { getStaticPaths };

const HouseKeeping: React.FC<IHamburgerProps & IHousekeepingProps> = () => {
  const { t } = useTranslation('housekeeping');
  const locale = useLocale();
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [showServiceRequest, setShowServiceRequest] = useState([]);
  const [showSchedules, setShowSchedules] = useState([]);

  const housekeepingInfo = useReactiveVar(housekeepingStorage);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);

  const itemsCount = housekeepingInfo?.selectedItems?.filter((item) => item?.quantity > 0)?.length;

  const toggleConfirmOpened = useCallback(() => {
    setConfirmOpened((oldState) => !oldState);
  }, []);

  const { data, loading } = useQuery<IGetHousekeepingApiResponse>(GET_HOUSEKEEPING, {
    context: { clientName: 'host_v1' },
    variables: {
      lang: locale === 'en' ? '' : locale,
    },
  });

  useEffect(() => {
    if (data) {
      const selectedServiceRequests: any = data?.getServiceRequestDetails;
      const serviceRequest = selectedServiceRequests[houseKeepingOptionSelected?.label]?.filter(
        (el: any) => el?.isActive,
      );

      setShowServiceRequest(serviceRequest);
    }
  }, [data, houseKeepingOptionSelected?.label]);

  const handleClick = (selectedRequest: any) => {
    setConfirmOpened(true);
    setShowSchedules(selectedRequest);
  };

  return (
    <>
      <Head>
        <title>{t('Services')}</title>
      </Head>
      <Header displayHome screenTitle={t('Services') as string} />
      <div className={styles.housekeepingWrapper}>
        {loading ? (
          <>
            <div className={styles.container}>
              <HousekeepingItemSkeleton />
              <HousekeepingItemSkeleton />
              <HousekeepingItemSkeleton />
              <HousekeepingItemSkeleton />
              <HousekeepingItemSkeleton />
              <HousekeepingItemSkeleton />
              <HousekeepingItemSkeleton />
              <HousekeepingItemSkeleton />
            </div>
          </>
        ) : (
          <>
            <PageWrapper displayBottomMenu className={styles.pageWrapper}>
              <div className={styles.container}>
                {showServiceRequest?.length !== 0 ? (
                  showServiceRequest?.map((item: any) => (
                    <div className={styles.margin} key={item.id}>
                      <HousekeepingItem housekeepingItem={item} handleClick={handleClick} />
                    </div>
                  ))
                ) : (
                  <div className={styles.information}>{t('No information found')}</div>
                )}
              </div>
            </PageWrapper>
          </>
        )}
        {itemsCount > 0 && (
          <div className={styles.orderButtonWrapper}>
            <StyledButton
              disabled={itemsCount === 0}
              onClick={toggleConfirmOpened}
              className={styles.orderButton}
            >
              <p className={styles.orderContents}>{String(itemsCount).padStart(0)}</p>
              <span className={styles.orderText}>{t('CONFIRM REQUEST')}</span>
            </StyledButton>
          </div>
        )}

        <HousekeepingDrawer
          opened={confirmOpened}
          toggleOpened={toggleConfirmOpened}
          showSchedules={showSchedules}
        />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['housekeeping', 'common'], i18nConfig)),
    },
  };
};

export default HouseKeeping;
