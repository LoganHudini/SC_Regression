import { useQuery, useReactiveVar } from '@apollo/client';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect } from 'react';
import { getStaticPaths } from 'utils/getStatic';
import styles from '../../styles/spa/spa.module.scss';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import { toggleDetailsDrawer, toggleHamburgerMenuDrawer } from 'storage/home.storage';
import { activeItems } from 'utils/functions';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { DetailDrawer } from 'components/shared/DetailDrawer/DetailDrawer';
import { GET_SPA_DETAILS } from 'core/graphql/queries/GET_SPA_DETAILS';
import Head from 'next/head';
import { spaInformationStorage } from 'storage/spa.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import produce from 'immer';
import { Notification } from 'components/shared/Notification/Notification';
import { availablePaths } from 'utils/availablePaths';
import { ASSETS_URL, CURRENCY } from 'core/graphql/endpoints';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { ACTIVE } from 'utils/constants';

export { getStaticPaths };

const Spa: React.FC = () => {
  const { t } = useTranslation(['spa']);
  const spaInfo = useReactiveVar(spaInformationStorage);
  const spaDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const { data, loading } = useQuery(GET_SPA_DETAILS, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
  });

  const spaTreatmentsList = activeItems(data?.getSpaDetails?.treatments)?.filter(
    (treatment: any) => treatment?.spaId === spaInfo?.selectedSpaInfoId,
  );

  const spaCategory = data?.getSpaDetails?.categories?.find(
    (category: any) => category?.id === spaTreatmentsList[0]?.spaCategoryId,
  );

  const selectedSpaItem = spaTreatmentsList?.find(
    (item: any) => item?.id === spaInfo?.selectedSpaTreatmentId,
  );

  useEffect(() => {
    data?.getSpaDetails?.spa &&
      spaInformationStorage({
        selectedSpaInfoName:
          spaInfo?.selectedSpaInfoName ?? activeItems(data?.getSpaDetails?.spa)[0]?.name,
        selectedSpaInfoId:
          spaInfo?.selectedSpaInfoId ?? activeItems(data?.getSpaDetails?.spa)[0]?.id,
        selectedSpaCategoryName: spaCategory?.name,
        selectedSpaCategoryId: spaCategory?.id,
      });
  }, [
    data?.getSpaDetails?.spa,
    spaCategory?.id,
    spaCategory?.name,
    spaInfo?.selectedSpaInfoId,
    spaInfo?.selectedSpaInfoName,
  ]);

  const selectedSpa = (treatment: any) => {
    spaInformationStorage(
      produce(spaInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedSpaTreatmentName = treatment?.name;
          draft.selectedSpaTreatmentId = treatment?.id;
        }
      }),
    );
    toggleDetailsDrawer(true);
    toggleHamburgerMenuDrawer(false);
  };

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
  };

  const spaDetails = () => (
    <>
      <StableImage
        className={styles.image}
        src={
          selectedSpaItem?.images && selectedSpaItem?.images[0]
            ? `${ASSETS_URL}/${selectedSpaItem?.images[0]?.ratio16to9}`
            : undefined
        }
      />

      {/* {selectedSpaItem?.cta?.status === ACTIVE && (
        <StyledButton variant='contained' onClick={onCtaClick} className={styles.button}>
          {selectedSpaItem?.cta?.ctaTitle || t('BOOK NOW')}
        </StyledButton>
      )} */}

      <div className={styles.wrapper}>
        {selectedSpaItem?.name && (
          <h2 className={styles.detailComponentTitle}>{t(`${selectedSpaItem?.name}`)}</h2>
        )}

        {selectedSpaItem?.duration && selectedSpaItem?.duration[0]?.price && (
          <p className={styles.detailComponentDuration}>
            <span className={styles.currency}>{CURRENCY} </span>
            {selectedSpaItem?.duration[0]?.price}
            {'   '}|{'   '}
            {selectedSpaItem?.duration[0]?.duration} Min
          </p>
        )}

        {selectedSpaItem?.description && (
          <p className={styles.detailComponentDescription}>
            {t(`${selectedSpaItem?.description}`)}
          </p>
        )}
      </div>

      <Notification
        title={t('Thank You!') as string}
        description={
          t(
            'Your booking has been received. Our reservation team will get in touch with you soon',
          ) as string
        }
        redirect={availablePaths?.SPA}
        type={'success'}
      />
    </>
  );

  return (
    <>
      <Head>
        <title>{t('Spa')}</title>
      </Head>
      <Header screenTitle={t('Spa') as string} displayHome />
      {loading ? (
        <Loader />
      ) : (
        <PageWrapper
          className={styles.pageWrapper}
          displayBottomMenu={spaCategory && spaTreatmentsList}
        >
          <div>
            {spaTreatmentsList?.map((selectedSpaItem: any) => (
              <ListComponentEntity
                key={selectedSpaItem.id}
                queryResultEntity={selectedSpaItem}
                selectedListItem={selectedSpa}
              />
            ))}
          </div>
        </PageWrapper>
      )}

      <DetailDrawer open={spaDetailsDrawerStatus} onClose={closeDrawer} content={spaDetails()} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['spa', 'common'], i18nConfig)),
    },
  };
};
export default Spa;
