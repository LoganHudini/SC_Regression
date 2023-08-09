/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from 'react';
import cx from 'classnames';
import styles from './DiningBottomBar.module.scss';
import CloseOutlinedIcon from '@icons/CloseOutlined.svg';
import { IDiningBottomBarProps } from './DiningBottomBar.types';
import LinkComponent from 'utils/link';
import { availablePaths } from 'utils/availablePaths';
import { useTranslation } from 'react-i18next';
import { tableReservationStorage } from 'storage/table-reservation.storage';
import { useRouter } from 'next/router';

export const DiningBottomBar: React.FC<IDiningBottomBarProps> = ({
  toggleDiningBottomBarOpened,
  opened,
}) => {
  const { t } = useTranslation('common');

  const handleNavigate = () => {
    toggleDiningBottomBarOpened();
    tableReservationStorage({
      restaurantName: '',
      id: '',
    });
    localStorage.setItem('tableNumber', JSON.stringify(''));
    localStorage.setItem('restaurantId', JSON.stringify(''));
    localStorage.setItem(
      'FandB_guestDetails',
      JSON.stringify({
        name: '',
        phoneNumber: '',
        roomNumber: '',
      }) ?? '',
    );

    if (typeof window !== 'undefined') {
      const item = localStorage.getItem('guestDetails');
      if (item === null) {
        localStorage.setItem(
          'guestDetails',
          JSON.stringify({
            name: '',
            roomNumber: '',
          }) ?? '',
        );
      }
    }
  };

  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  function enableScroll() {
    document.body.style.overflow = '';
  }

  useEffect(() => {
    if (opened) {
      disableScroll();
    } else {
      enableScroll();
    }
  }, [opened]);

  return (
    <>
      <div
        className={cx(styles.blurOverlay, { [styles.blurOverlayDisplayed]: opened })}
        onClick={toggleDiningBottomBarOpened}
      />

      <div className={cx(styles.wrapper, { [styles.wrapperDisplayed]: opened })}>
        <button onClick={toggleDiningBottomBarOpened} className={styles.closeBtn}>
          <CloseOutlinedIcon className={styles.closeBtnIcon} />
        </button>
        <div className={styles.wrappertitle}>{t('Select to proceed')}</div>
        <LinkComponent
          href={`${availablePaths.DINING}`}
          className={styles.diningElementWrapper}
          onClick={handleNavigate}
        >
          <div className={styles.diningElementBlurOverlay} />
          <p className={styles.diningElementText}>{t('In-Room Dining')}</p>
        </LinkComponent>
        <LinkComponent
          href={`${availablePaths?.RESTAURANTS_BARS}`}
          className={styles.diningElementWrapper}
          onClick={toggleDiningBottomBarOpened}
        >
          <div className={styles.diningElementBlurOverlay} />
          <p className={styles.diningElementText}>{t('Restaurants & Bars')}</p>
        </LinkComponent>
      </div>
    </>
  );
};
