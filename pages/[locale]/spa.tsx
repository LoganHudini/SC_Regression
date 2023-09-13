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

export { getStaticPaths };

const Spa: React.FC = () => {
  const { t } = useTranslation(['spa']);
  const spaInfo = useReactiveVar(spaInformationStorage);
  const spaDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const { data, loading } = useQuery(GET_SPA_DETAILS, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
  });

  const selectedSpa = (treatment: any) => {
    spaInformationStorage(
      produce(spaInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedSpaTreatmentId = treatment?.name;
          draft.selectedSpaTreatmentId = treatment?.id;
        }
      }),
    );
    // toggleDetailsDrawer(true);
    toggleHamburgerMenuDrawer(false);
  };

  const spaTreatmentsList = activeItems(data?.getSpaDetails?.treatments)?.filter(
    (treatment: any) => treatment?.spaId === spaInfo?.selectedSpaInfoId,
  );

  const spaCategory = data?.getSpaDetails?.categories?.find(
    (category: any) => category?.id === spaTreatmentsList[0]?.spaCategoryId,
  );

  useEffect(() => {
    data?.getSpaDetails?.spa &&
      spaInformationStorage({
        selectedSpaInfoName: activeItems(data?.getSpaDetails?.spa)[0]?.name,
        selectedSpaInfoId: activeItems(data?.getSpaDetails?.spa)[0]?.id,
        selectedSpaCategoryName: spaCategory?.name,
        selectedSpaCategoryId: spaCategory?.id,
      });
  }, [data?.getSpaDetails?.spa, spaCategory?.id, spaCategory?.name]);

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
  };

  const spaDetails = () => <div>Hello</div>;

  return (
    <>
      <Head>
        <title>{t('Spa')}</title>
      </Head>
      <Header screenTitle={t('Spa') as string} displayHome />
      {loading ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper} displayBottomMenu>
          <div>
            {spaTreatmentsList?.map((queryResultEntity: any) => (
              <ListComponentEntity
                key={queryResultEntity.id}
                queryResultEntity={queryResultEntity}
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
