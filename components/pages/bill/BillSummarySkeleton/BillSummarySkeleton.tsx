import React from 'react';
import ArrowForwardIcon from '@icons/ArrowForward.svg';
import styles from './BillSummarySkeleton.module.scss';
import cx from 'classnames';

export const BillSummarySkeleton: React.FC = () => {
  return (
    <div className={styles.staySummary}>
      <div className={styles.staySummaryInner}>
        <div className={styles.staySummaryColumn}>
          <h3 className={cx(styles.staySummaryColumnTitle, styles.animation)} />
          <p className={cx(styles.staySummaryColumnValue, styles.animation)} />
        </div>
        <ArrowForwardIcon className={styles.arrow} />
        <div className={styles.staySummaryColumn}>
          <h3 className={cx(styles.staySummaryColumnTitle, styles.animation)} />
          <p className={cx(styles.staySummaryColumnValue, styles.animation)} />
        </div>
        <div className={styles.staySummaryColumn}>
          <h3 className={cx(styles.staySummaryColumnTitleLast, styles.animation)} />
          <p className={cx(styles.staySummaryColumnValueLast, styles.animation)} />
        </div>
      </div>
    </div>
  );
};
