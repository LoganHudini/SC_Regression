/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery, useReactiveVar } from '@apollo/client';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useCallback } from 'react';
import { getStaticPaths } from 'utils/getStatic';
import styles from '../../styles/spa/spa.module.scss';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import { toggleDetailsDrawer, toggleHamburgerMenuDrawer } from 'storage/home.storage';
import { activeItems } from 'utils/functions';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { GET_SPA_DETAILS } from 'core/graphql/queries/GET_SPA_DETAILS';
import Head from 'next/head';
import { spaCategoryList, spaInformationStorage } from 'storage/spa.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import produce from 'immer';
import { Notification } from 'components/shared/Notification/Notification';
import { availablePaths } from 'utils/availablePaths';
import { ASSETS_URL, CURRENCY } from 'core/graphql/endpoints';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useRouter } from 'next/router';
import { downloadFile } from 'utils/downloadFile';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';

export { getStaticPaths };

const Spa: React.FC = () => {
  const { t } = useTranslation(['spa']);
  const router = useRouter();
  const spaInfo = useReactiveVar(spaInformationStorage);
  const spaDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const { data, loading } = useQuery(GET_SPA_DETAILS, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
  });

  const spaInfoURL = activeItems(data?.getSpaDetails?.spa)?.find(
    (info: any) => info?.id === spaInfo?.selectedSpaInfoId,
  );

  const spaTreatmentsList = activeItems(data?.getSpaDetails?.treatments)?.filter(
    (treatment: any) =>
      treatment?.spaId === spaInfo?.selectedSpaInfoId &&
      treatment?.spaCategoryId === spaInfo?.selectedSpaCategoryId,
  );

  let spaCategory: any = [];
  data?.getSpaDetails?.categories?.forEach((category: any) => {
    activeItems(data?.getSpaDetails?.treatments)?.forEach((treatment: any) => {
      if (
        treatment?.spaId === spaInfo?.selectedSpaInfoId &&
        category?.id === treatment?.spaCategoryId &&
        !spaCategory?.includes(category)
      ) {
        spaCategory = [...spaCategory, category];
      }
    });
  });

  spaCategoryList(spaCategory);
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
        selectedSpaCategoryName: spaCategory[0]?.name,
        selectedSpaCategoryId: spaCategory[0]?.id,
      });
  }, [
    data?.getSpaDetails?.spa,
    spaCategory[0],
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
    spaInformationStorage(
      produce(spaInformationStorage(), (draft) => {
        null;
      }),
    );
  };

  const onCtaClick = () => {
    const menuType = spaInfoURL?.treatmentsMenu?.split('type=')[1].split('}')[0].split(',')[0];

    if (menuType === 'WEB_URL') {
      router.push(spaInfoURL?.treatmentsMenu?.split('=')[1].split(',')[0]);
    }

    if (menuType === 'S3') {
      downloadFile(
        `${ASSETS_URL}/${spaInfoURL?.treatmentsMenu?.split('=')[1].split(',')[0]}`,
        'treatmentsMenu.pdf',
      );
    }
  };

  const spaDetails = () => (
    <>
      {selectedSpaItem?.images[0]?.ratio16to9 ? (
        <StableImage
          className={styles.image}
          src={`${ASSETS_URL}/${selectedSpaItem?.images[0]?.ratio16to9}`}
        />
      ) : (
        <div className='imagePlaceHolderAnimation' />
      )}
      {/* {selectedSpaItem?.cta?.status === ACTIVE && (
        <StyledButton variant='contained' onClick={onCtaClick} className={styles.button}>
          {selectedSpaItem?.cta?.ctaTitle || t('BOOK NOW')}
        </StyledButton>
      )} */}

      {/* demo purpose only */}
      {spaInfoURL && (
        <StyledButton variant='contained' onClick={onCtaClick} className={styles.button}>
          {t('BOOK NOW')}
        </StyledButton>
      )}
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

      <CustomDrawer open={spaDetailsDrawerStatus} onClose={closeDrawer} content={spaDetails()} />
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
