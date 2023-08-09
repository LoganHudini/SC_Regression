import React from 'react';
import cx from 'classnames';
import styles from './DiningMenuElementSkeleton.module.scss';

export const DiningMenuElementSkeleton: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.topWrapper}>
        <div className={cx(styles.image, styles.animation)} />
        <div className={styles.titleDescriptionWrapper}>
          <div className={styles.titleRow}>
            <div className={cx(styles.title, styles.animation)} />
            <div className={cx(styles.price, styles.animation)} />
          </div>

          <p className={cx(styles.description, styles.animation)} />
        </div>
      </div>
      <div className={styles.servingsRow}>
        <p className={cx(styles.servingsText, styles.animation)} />
        <div className={cx(styles.servingsCounter, styles.animation)} />
      </div>
    </div>
  );
};
