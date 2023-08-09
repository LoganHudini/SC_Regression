import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RoomControlsTvListFilter } from 'components/pages/room-controls-tv-list/RoomControlsTvListFilter/RoomControlsTvListFilter';
import { Header } from 'components/shared/Header/Header';
import styles from '../../../styles/room-controls-tv-list/room-controls-tv-list.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { availablePaths } from 'utils/availablePaths';

export { getStaticPaths };

const TEMPLATE_CHANNELS = [
  {
    number: 312,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 317,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 412,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 567,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 311,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 212,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 566,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 999,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 545,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 312,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 317,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 412,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 567,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 311,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
  {
    number: 212,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_logo.svg/2560px-CNBC_logo.svg.png',
  },
];

const RoomControlsTvList: React.FC = () => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('room-controls-tv-list');

  const onCloseBtnClick = useCallback(() => {
    navigate(availablePaths.ROOM_CONTROLS_TV);
  }, [navigate]);

  return (
    <>
      <Head>
        <title>{t('TV Channel')}</title>
      </Head>
      <Header onCloseBtnClick={onCloseBtnClick} displayCloseButton />
      <RoomControlsTvListFilter />
      <div className={styles.roomControlsTvListWrapper}>
        <div className={styles.channelsContainer}>
          {TEMPLATE_CHANNELS.map((channel, index) => (
            <button className={styles.channelWrapper} key={index}>
              <StableImage className={styles.channelImage} src={channel.image} />
              <p className={styles.channelNumber}>{channel.number}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['room-controls-tv-list'], i18nConfig)),
    },
  };
};

export default RoomControlsTvList;
