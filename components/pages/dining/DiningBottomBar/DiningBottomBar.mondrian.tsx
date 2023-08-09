/* eslint-disable @next/next/no-img-element */
import React from 'react';
import cx from 'classnames';
import styles from './DiningBottomBar.module.scss';
import CloseOutlinedIcon from '@icons/CloseOutlined.svg';
import { IDiningBottomBarProps } from './DiningBottomBar.types';
import LinkComponent from 'utils/link';
import { availablePaths } from 'utils/availablePaths';
import { useCheckedIn } from 'storage/check-in.storage';

export const DiningBottomBar: React.FC<IDiningBottomBarProps> = ({
  toggleDiningBottomBarOpened,
  opened,
}) => {
  const checkinData = useCheckedIn();

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

        <LinkComponent
          href={checkinData?.checkedIn ? availablePaths?.DINING : availablePaths?.CHECK_IN}
          className={styles.diningElementWrapper}
          onClick={toggleDiningBottomBarOpened}
        >
          <div className={styles.diningElementBlurOverlay} />
          <img
            className={styles.diningElementImage}
            src='/images/default/inRoomDining.png'
            alt=''
            width={165}
            height={165}
          />
          <p className={styles.diningElementText}>In-Room Dining</p>
        </LinkComponent>

        <LinkComponent
          href={availablePaths?.RESTAURANTS_BARS}
          className={styles.diningElementWrapper}
          onClick={toggleDiningBottomBarOpened}
        >
          <div className={styles.diningElementBlurOverlay} />
          <img
            className={styles.diningElementImage}
            src='/images/default/restaurantBars.png'
            alt=''
            width={165}
            height={165}
          />
          <p className={styles.diningElementText}>Restaurants & Bars</p>
        </LinkComponent>
      </div>
    </>
  );
};
