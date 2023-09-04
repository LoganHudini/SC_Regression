/* eslint-disable @next/next/no-img-element */
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import styles from '../../../styles/pre-check-in-confirmation/pre-check-in-confirmation.module.scss';
import CheckMarkIcon from '@icons/checkMark.svg';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { Drawer } from '@mui/material';
import { HOTEL_CODE } from 'core/graphql/endpoints';
import CloseOutlinedIcon from '@icons/CloseOutlined.svg';
import ShareIcon from '@icons/share.svg';
import AppStoreIcon from '@icons/AppStoreIcon.svg';
import { RWebShare } from 'react-web-share';

export { getStaticPaths };

const PreCheckinConfirmation = () => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('pre-check-in-confirmation');
  const [inputDrawer, setInputDrawer] = useState(true);
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths.GET_RESERVATION);
    }
  }, [reservationData, navigate]);

  const closeInputDrawer = useCallback(() => {
    setInputDrawer((state) => !state);
    navigate(availablePaths?.HOME);
  }, [navigate]);

  return (
    <>
      <Drawer
        variant='temporary'
        anchor='bottom'
        open={inputDrawer}
        PaperProps={{
          elevation: 0,
          style: {
            borderTopRightRadius: '2rem',
            borderTopLeftRadius: '2rem',
            maxWidth: '772px',
            margin: 'auto',
            maxHeight: '90vh',
            overflow: 'auto',
          },
        }}
        BackdropProps={{
          style: {
            backgroundImage: `url('/images/${HOTEL_CODE}/background.png')`,
            maxWidth: '772px',
            margin: 'auto',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          },
        }}
      >
        <PageWrapper>
          <div onClick={closeInputDrawer} className={styles.closeBtn}>
            <CloseOutlinedIcon />
          </div>
          <div className={styles.dataWrapper}>
            <CheckMarkIcon className={styles.okIcon} />
            <h2 className={styles.checkInCompleteText}>
              {t('You have successfully checked in to')}
            </h2>
            <p className={styles.instructionsText}>{t('Room')}</p>
            <h1 className={styles.roomNumber}>404</h1>
            <div className={styles.download}>
              <p className={styles.downloadText}>{t('Download Accor Key App')}</p>
              <div>
                <img src={`/images/${HOTEL_CODE}/GroupLogo.png`} alt='Accor' />
              </div>
              <span className={styles.spaceIcon}>
                <img
                  src={`/images/${HOTEL_CODE}/GooglePlayIcon.png`}
                  alt='Google play'
                  className={styles.pointer}
                />
              </span>
              <span>
                <AppStoreIcon className={styles.pointer} />
              </span>
              <div className={styles.textWrapper}>
                <p className={styles.keyText}>
                  {t('Planning to use a physical room key instead?')}
                </p>
                <p className={styles.successText}>
                  {t('Please reach out to the front desk for your key')}
                </p>
              </div>
            </div>
            <div className={styles.shareWrapper}>
              <span className={styles.icon}>
                <RWebShare
                  data={{
                    url: 'https://mondrian.hudinielevate-uat.io',
                  }}
                >
                  <ShareIcon className={styles.pointer} />
                </RWebShare>
              </span>
              <span className={styles.shareText}>
                {t('You can share the app link with your accompanying guests')}
              </span>
            </div>
          </div>
        </PageWrapper>
      </Drawer>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['pre-check-in-confirmation', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default PreCheckinConfirmation;
