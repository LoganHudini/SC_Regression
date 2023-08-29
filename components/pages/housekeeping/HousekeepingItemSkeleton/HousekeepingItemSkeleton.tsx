import React from 'react';
import cx from 'classnames';
import styles from './HousekeepingItemSkeleton.module.scss';

export const HousekeepingItemSkeleton: React.FC = () => {
  return (
    <div className={cx(styles.container)}>
      <div className={cx(styles.housekeepingItemWrapper, styles.animation)} />
    </div>
  );
};
