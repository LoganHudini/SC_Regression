import React from 'react';
import cx from 'classnames';
import styles from './BillElementSkeleton.module.scss';

export const BillElementSkeleton: React.FC = () => {
  return (
    <div className={styles.billElement}>
      <div className={styles.infoColumn}>
        <div className={cx(styles.time, styles.animation)} />
        <div className={cx(styles.title, styles.animation)} />
      </div>
      <div className={styles.infoColumn}>
        <div className={cx(styles.chequeNo, styles.animation)} />
        <div className={cx(styles.price, styles.animation)} />
      </div>
    </div>
  );
};
