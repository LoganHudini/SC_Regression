import cx from 'classnames';
import React from 'react';
import styles from './UpcomingStaySkeleton.module.scss';

export const UpcomingStaySkeleton: React.FC = () => {
  return (
    <div className={styles.upcomingStayWrapper}>
      <div className={cx(styles.upcomingStayImage, styles.animation)} />
      <div className={styles.upcomingStayTextWrapper}>
        <div className={styles.checkWrapper}>
          <div className={styles.checkInWrapper}>
            <p className={cx(styles.checkText, styles.animation)}></p>
            <p className={cx(styles.checkDate, styles.animation)}></p>
          </div>
          <div className={styles.checkOutWrapper}>
            <p className={cx(styles.checkText, styles.animation)}></p>
            <p className={cx(styles.checkDate, styles.animation)}></p>
          </div>
        </div>
        <div className={styles.hotelDataWrapper}>
          <div className={styles.hotelDataColumn}>
            <p className={cx(styles.hotelDataText, styles.animation)}></p>
            <p className={cx(styles.hotelDataText, styles.animation)}></p>
          </div>
          <p className={cx(styles.nightsCount, styles.animation)}></p>
        </div>
      </div>
    </div>
  );
};
