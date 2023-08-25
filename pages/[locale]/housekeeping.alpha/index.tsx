import Head from 'next/head';
import React, { useCallback, useState } from 'react';
import { HousekeepingItem } from 'components/pages/housekeeping/HousekeepingItem/HousekeepingItem';
import { Header } from 'components/shared/Header/Header';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import styles from '../../../styles/housekeeping/housekeeping.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { HousekeepingConfirm } from 'components/pages/housekeeping/HousekeepingConfirm/HousekeepingConfirm';
import {
  GET_HOUSEKEEPING,
  IGetHousekeepingApiResponse,
} from 'core/graphql/queries/GET_HOUSEKEEPING';
import { useQuery, useReactiveVar } from '@apollo/client';
import { housekeepingStorage } from 'storage/housekeeping.storage';
import { HousekeepingItemSkeleton } from 'components/pages/housekeeping/HousekeepingItemSkeleton/HousekeepingItemSkeleton';
import { HousekeepingRequestModal } from 'components/pages/housekeeping/HousekeepingRequestModal/HousekeepingRequestModal';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'utils/hooks/useLocalizedRouter';

export { getStaticPaths };

const HouseKeeping = () => {
  const { t } = useTranslation('housekeeping');
  const locale = useLocale();
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [showHouseKeepingData, setShowHouseKeepingData] = useState(true);
  const [showConciergeData, setShowConciergeData] = useState(false);

  const housekeepingInfo = useReactiveVar(housekeepingStorage);

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

  const housekeeping = data?.getServiceRequestDetails.houseKeeping.filter((el) => el?.isActive);
  const concierge = data?.getServiceRequestDetails?.concierge?.filter((el) => el?.isActive);

  const showHouseKeeping = () => {
    setShowHouseKeepingData(true);
    setShowConciergeData(false);
  };

  const showConcierge = () => {
    setShowHouseKeepingData(false);
    setShowConciergeData(true);
  };

  return (
    <>
      <Head>
        <title>{t('Services')}</title>
      </Head>
      <Header displayHome screenTitle={t('Housekeeping') as string} />
      <div className={styles.housekeepingWrapper}>
        {loading ? (
          <>
            <HousekeepingItemSkeleton />
            <HousekeepingItemSkeleton />
            <HousekeepingItemSkeleton />
            <HousekeepingItemSkeleton />
          </>
        ) : (
          <>
            <div className={styles.btnWrapper}>
              <StyledButton
                className={showHouseKeepingData ? styles.buttonFilter : styles.buttonFilterDisabled}
                variant={'outlined'}
                onClick={showHouseKeeping}
              >
                {t('Housekeeping')}
              </StyledButton>

              <StyledButton
                className={showConciergeData ? styles.buttonFilter : styles.buttonFilterDisabled}
                variant={'outlined'}
                onClick={showConcierge}
              >
                {t('Concierge')}
              </StyledButton>
            </div>

            {showHouseKeepingData &&
              housekeeping?.map((item) => (
                <HousekeepingItem key={item.id} housekeepingItem={item} />
              ))}
            {showConciergeData &&
              concierge?.map((item) => <HousekeepingItem key={item.id} housekeepingItem={item} />)}
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

        <HousekeepingConfirm
          housekeepingItems={data?.getServiceRequestDetails.houseKeeping}
          conciergeItems={data?.getServiceRequestDetails?.concierge}
          opened={confirmOpened}
          toggleOpened={toggleConfirmOpened}
        />
        <HousekeepingRequestModal />
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
