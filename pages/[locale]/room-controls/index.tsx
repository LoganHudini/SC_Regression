import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ControlEntities from 'components/pages/room-controls/ControlEntities/ControlEntities';
import { LightControls } from 'components/pages/room-controls/LightControls/LightControls';
import { RoomControlsFilter } from 'components/pages/room-controls/RoomControlsFilter/RoomControlsFilter';
import { TempControls } from 'components/pages/room-controls/TempControls/TempControls';
import { TVControls } from 'components/pages/room-controls/TVControls/TVControls';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import styles from '../../../styles/room-controls/room-controls.module.scss';
import { ControlableEntities } from '../../../types/room-controls.types';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { useRouter } from 'next/router';

export { getStaticPaths };

const AVAILABLE_SELECT_ENTITIES = [
  ControlableEntities.LIGHTS,
  ControlableEntities.TEMP,
  ControlableEntities.TV,
];

const RoomControls = () => {
  const [activeControl, setActiveControl] = useState<ControlableEntities>(
    ControlableEntities.LIGHTS,
  );

  const { t } = useTranslation('room-controls');

  const router = useRouter();

  useLayoutEffect(() => {
    if (AVAILABLE_SELECT_ENTITIES.includes(router.query.selectedEntity as ControlableEntities)) {
      setActiveControl(router.query.selectedEntity as ControlableEntities);
    } else {
      setActiveControl(ControlableEntities.LIGHTS);
    }
  }, [router.query.selectedEntity]);

  return (
    <>
      <Head>
        <title>{t('Room Controls')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Room Controls') as string} />
      <RoomControlsFilter />
      <PageWrapper className={styles.pageWrapper} displayBottomMenu>
        <div className={styles.roomControlsWrapper}>
          <ControlEntities setActiveControl={setActiveControl} activeControl={activeControl} />

          {activeControl === ControlableEntities.LIGHTS && <LightControls />}
          {activeControl === ControlableEntities.TV && <TVControls />}
          {activeControl === ControlableEntities.TEMP && <TempControls />}
        </div>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['room-controls', 'common'], i18nConfig)),
    },
  };
};

export default RoomControls;
