import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import styles from '../../../styles/room-controls-tv-channel/room-controls-tv-channel.module.scss';
import ArrowBackIosIcon from '@icons/ArrowBackTvChannel.svg';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import cx from 'classnames';

export { getStaticPaths };

const RoomControlsTvChannel: React.FC = () => {
  const [currentChannel, setCurrentChannel] = useState('');

  const { t } = useTranslation('room-controls-tv-list');

  const navigate = useLocalizedRouter();

  const onCloseBtnClick = useCallback(() => {
    navigate(availablePaths.ROOM_CONTROLS_TV);
  }, [navigate]);

  const onTVButtonClick = useCallback((e: React.MouseEvent) => {
    setCurrentChannel((old) => `${old}${(e.target as HTMLButtonElement).innerText}`);
  }, []);

  const removeLastDigit = useCallback(() => {
    setCurrentChannel((old) => old.slice(0, -1));
  }, []);

  return (
    <>
      <Head>
        <title>{t('TV Channel')}</title>
      </Head>
      <Header onCloseBtnClick={onCloseBtnClick} displayCloseButton />
      <div className={styles.roomControlsTvChannelWrapper}>
        <p className={styles.centeredText}>{t('TV Channel')}</p>
        <h2 className={styles.currentChannel}>{currentChannel}</h2>
        <div className={styles.buttonsContainer}>
          <div className={styles.buttonsRow}>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              1
            </button>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              2
            </button>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              3
            </button>
          </div>
          <div className={styles.buttonsRow}>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              4
            </button>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              5
            </button>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              6
            </button>
          </div>
          <div className={styles.buttonsRow}>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              7
            </button>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              8
            </button>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              9
            </button>
          </div>
          <div className={styles.buttonsRow}>
            <button className={styles.tVButton} onClick={onTVButtonClick}>
              0
            </button>
            <button className={cx(styles.tVButton, styles.okButton)}>
              <p className={styles.tVButtonText}>OK</p>
            </button>
            <button className={cx(styles.tVButton, styles.backButton)} onClick={removeLastDigit}>
              <ArrowBackIosIcon className={styles.backIcon} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['room-controls-tv-channel'], i18nConfig)),
    },
  };
};

export default RoomControlsTvChannel;
