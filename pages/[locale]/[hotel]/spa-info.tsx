import React, { useEffect, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { getStaticPaths } from 'utils/getStatic';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import { Loader } from 'components/shared/Loaders/Loaders';
import { spaInformationStorage } from 'storage/spa.storage';
import { toggleDetailsDrawer } from 'storage/home.storage';
import { activeItems, getTimings } from 'utils/functions';
import { GET_SPA_DETAILS } from 'core/graphql/queries/GET_SPA_DETAILS';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import SpaDetails from 'components/pages/spa/SpaDetail';
import styles from '@styles/spa/spa.module.scss';
import { SPA_AND_WELLNESS } from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import NoInformation from 'components/shared/NoInformation/NoInformation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';

export { getStaticPaths };

const SpaInfo: React.FC = () => {
  const { t } = useTranslation(['spa']);
  const navigate = useLocalizedRouter();
  const hotelId = useConfig()?.hotelId;
  const locale = useLocale();
  const spaInfo = useReactiveVar(spaInformationStorage);
  const [spaBooking, setspaBooking] = useState(false);
  const [menu, setMenu] = useState(false);
  const [menuLink, setmenuLink] = useState(null);
  const spaDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const { data: spaList, loading: spaloading } = useQuery(GET_SPA_DETAILS, {
    skip: !hotelId,
    context: { clientName: 'property_a' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    spaInformationStorage({});
  };

  const spaInformationSpa = activeItems(spaList?.getSpaDetails?.spa);
  const spaInfoDetails = spaInformationSpa?.find(
    (info: any) => info?.id === spaInfo?.selectedSpaInfoId,
  );
  const spaTreatments =
    spaList?.getSpaDetails?.treatments?.length > 0 &&
    activeItems(spaList?.getSpaDetails?.treatments)?.filter(
      (item: any) => item?.spaId === spaInfoDetails?.id,
    );

  const time = getTimings(spaInfoDetails?.customAttributes);

  useEffect(() => {
    if (spaList?.getSpaDetails?.spa) {
      spaInformationStorage({
        selectedSpaInfoName:
          spaInfo?.selectedSpaInfoName ?? activeItems(spaList?.getSpaDetails?.spa)[0]?.name,
        selectedSpaInfoId:
          spaInfo?.selectedSpaInfoId ?? activeItems(spaList?.getSpaDetails?.spa)[0]?.id,
      });
    }
  }, [spaList]);

  const selectedSpaFunc = (spaList: any) => {
    spaInformationStorage({
      selectedSpaInfoName: spaList?.name,
      selectedSpaInfoId: spaList?.id,
    });
    toggleDetailsDrawer(true);
  };

  return (
    <>
      <Header screenTitle={t('Spa') as string} displayHome />
      {spaloading ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper} displayBottomMenu={spaInformationSpa}>
          <div>
            {spaInformationSpa?.length > 0 ? (
              spaInformationSpa?.map((spaList: any) => (
                <ListComponentEntity
                  key={spaList.id}
                  queryResultEntity={spaList}
                  selectedListItem={selectedSpaFunc}
                />
              ))
            ) : (
              <NoInformation
                message={t(
                  'At the moment, there are no spa services available. Please check back later. We appreciate your understanding.',
                )}
              />
            )}
          </div>
        </PageWrapper>
      )}
      {spaBooking || menu ? (
        <CustomDrawer
          open={spaBooking ? spaBooking : menu}
          onClose={spaBooking ? setspaBooking : setMenu}
          content={
            <IframeComponent
              src={spaBooking ? spaInfoDetails?.cta?.redirectUrl : menuLink}
              handledrawerState={spaBooking ? setspaBooking : setMenu}
              name={SPA_AND_WELLNESS}
            />
          }
          isIframe={true}
        />
      ) : (
        <CustomDrawer
          open={spaDetailsDrawerStatus}
          onClose={closeDrawer}
          content={
            <SpaDetails
              spaInfoDetails={spaInfoDetails}
              spaTreatments={spaTreatments}
              setspaBooking={setspaBooking}
              setMenu={setMenu}
              setmenuLink={setmenuLink}
              time={time}
            />
          }
        />
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['errors', 'spa', 'common'], i18nConfig)),
    },
  };
};
export default SpaInfo;
