import { CURRENCY } from 'core/graphql/endpoints';
import React from 'react';
import styles from './TotalBill.module.scss';
import { ITotalBillProps } from './TotalBill.types';

export const TotalBill: React.FC<ITotalBillProps> = ({ totalAmountDue, totalBillAmount }) => {
  return (
    <>
      <div className={styles.totalBillAmountWrapper}>
        <p className={styles.billAmountTitle}>Total Bill Amount</p>
        <p className={styles.billAmountValue}>
          <span className={styles.billAmountCurrency}>{CURRENCY}</span> {totalBillAmount}
        </p>
      </div>

      <div className={styles.totalAmountDueWrapper}>
        <p className={styles.billAmountTitle}>Total Due Amount</p>
        <p className={styles.billAmountValue}>
          <span className={styles.billAmountCurrency}>{CURRENCY}</span> {totalAmountDue}
        </p>
      </div>
    </>
  );
};
