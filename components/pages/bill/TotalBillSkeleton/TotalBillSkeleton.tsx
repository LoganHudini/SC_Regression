import React from 'react';
import cx from 'classnames';
import styles from './TotalBillSkeleton.module.scss';

export const TotalBillSkeleton: React.FC = () => {
  return (
    <>
      <div className={styles.totalBillAmountWrapper}>
        <p className={cx(styles.billAmountTitle, styles.animation)} />
        <p className={cx(styles.billAmountValue, styles.animation)} />
      </div>

      <div className={styles.totalAmountDueWrapper}>
        <p className={cx(styles.billAmountTitle, styles.animation)} />
        <p className={cx(styles.billAmountValue, styles.animation)} />
      </div>
    </>
  );
};
