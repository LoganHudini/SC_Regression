import styles from './DiningCategorySkeleton.module.scss';
import React from 'react';
import cx from 'classnames';

export const DiningCategorySkeleton: React.FC = () => {
  return (
    <div className={styles.diningElement}>
      <div className={cx(styles.diningImage, styles.animation)} />
      <div className={styles.diningText}>
        <h3 className={cx(styles.diningTitle, styles.animation)} />
      </div>
    </div>
  );
};
