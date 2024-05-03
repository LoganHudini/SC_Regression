import Head from 'next/head';
import React, { useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import styles from '@styles/upgrade-room/upgrade-room.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useReactiveVar } from '@apollo/client';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { personalizationStorage } from 'storage/personalize-your-room.storage';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { RoomPersonalizationEntityV2 } from 'components/pages/personalize-your-room-v2/RoomPersonalizationEntityV2/RoomPersonalizationEntityV2';
import { CHECK_IN, UPGRADE_ROOM } from 'utils/constants';
import { Notification } from 'components/shared/Notification/Notification';
import { useConfig } from 'utils/hooks/useConfiguration';
import { Stepper } from 'components/shared/Stepper/Stepper';
import cx from 'classnames';
import InfoIcon from '@icons/info_icon.svg';

export { getStaticPaths };

const PersonalizeYourRoom: React.FC = () => {
  const { t } = useTranslation(['personalize-your-room', 'check-in']);
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const [notificationState, setNotificationState] = useState<any>(false);

  const checkInModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const upgradeRoomConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === UPGRADE_ROOM && submodule.isActive,
  );

  const availablePersonalizations = useReactiveVar(personalizationStorage);

  const filteredRoomList: any =
    availablePersonalizations?.length > 0 &&
    availablePersonalizations?.filter((item: any) => item?.isActive && item?.type === 'Room');

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Upgrade My Room')}
        </title>
      </Head>
      <Header
        displayBackButton
        screenTitle={t(`${upgradeRoomConfig?.label}`) as string}
        backRoute={availablePaths?.GUEST_VERIFICATION}
      />
      <PageWrapper className={styles.pageWrapper}>
        <Stepper />
        <div className={styles.titleWrapper}>
          <p className={styles.title}>{t('Elevate Your Stay \n with a Room Upgrade')}</p>
          <p className={styles.description}>
            {t('Upgrade your room today for an even more memorable experience.')}
          </p>
          <p className={styles.info}>
            <InfoIcon className={styles.icon} />
            {t('Room upgrade confirmation is subject to availability.')}
          </p>
        </div>
        <div className={styles.personalizationEntitiesWrapper}>
          {filteredRoomList?.length > 0 &&
            filteredRoomList?.map((el: any, index: number) => (
              <RoomPersonalizationEntityV2
                key={index}
                id={index}
                title={el.name}
                description={el.description}
                price={el.cost}
                type={UPGRADE_ROOM}
                currency={el.currency}
                maxQuantity={el.maxQuantity}
                setNotificationState={setNotificationState}
                code={el.code}
              />
            ))}
        </div>

        <div className={styles.confirmButtonWrapper}>
          <StyledButton
            className={cx(styles.confirmButton)}
            variant='contained'
            onClick={() => navigate(availablePaths?.CARD_AUTHORISATION)}
          >
            {t('Continue')}
          </StyledButton>
        </div>
        <Notification
          title={notificationState?.title}
          description={notificationState?.description}
          redirect={notificationState?.redirect}
          type={notificationState?.type}
        />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['personalize-your-room', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default PersonalizeYourRoom;
