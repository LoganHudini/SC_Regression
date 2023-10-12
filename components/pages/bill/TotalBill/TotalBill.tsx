import { CURRENCY } from 'core/graphql/endpoints';
import React from 'react';
import styles from './TotalBill.module.scss';
import { ITotalBillProps } from './TotalBill.types';
import { useTranslation } from 'react-i18next';

export const TotalBill: React.FC<ITotalBillProps> = ({ totalAmountDue, totalBillAmount }) => {
  const { t } = useTranslation(['common']);

  return (
    <>
      <div className={styles.totalBillAmountWrapper}>
        <p className={styles.billAmountTitle}>{t('Total Bill Amount')}</p>
        <p className={styles.billAmountValue}>
          <span className={styles.billAmountCurrency}>{CURRENCY} </span> {totalBillAmount}
        </p>
      </div>

      <div className={styles.totalAmountDueWrapper}>
        <p className={styles.billAmountTitle}>{t('Total Amount Due')}</p>
        <p className={styles.billAmountValue}>
          <span className={styles.billAmountCurrency}>{CURRENCY} </span> {totalAmountDue}
        </p>
      </div>
    </>
  );
};
