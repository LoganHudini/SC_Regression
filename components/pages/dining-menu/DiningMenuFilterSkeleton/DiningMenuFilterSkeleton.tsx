import React from 'react';
import styles from './DiningMenuFilterSkeleton.module.scss';
import cx from 'classnames';

export const DiningMenuFilterSkeleton: React.FC = () => {
  return (
    <div className={styles.diningMenuFilterWrapper}>
      <div className={cx(styles.diningMenuFilterButtonWrapper, styles.animation)}></div>
      <div className={cx(styles.diningMenuFilterButtonWrapper, styles.animation)}></div>
      <div className={cx(styles.diningMenuFilterButtonWrapper, styles.animation)}></div>
    </div>
  );
};
