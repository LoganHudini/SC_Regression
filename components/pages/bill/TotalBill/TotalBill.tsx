import React from 'react';
import styles from './TotalBill.module.scss';
import { ITotalBillProps } from './TotalBill.types';
import { useTranslation } from 'react-i18next';

export const TotalBill: React.FC<ITotalBillProps> = ({
  totalAmountDue,
  totalBillAmount,
  currency,
}) => {
  const { t } = useTranslation(['common']);

  return (
    <>
      <div className={styles.totalBillAmountWrapper}>
        <p className={styles.billAmountTitle}>{t('Total Bill Amount')}</p>
        <p className={styles.billAmountValue}>
          <span className={styles.billAmountCurrency}>{currency} </span>{' '}
          {Number(totalBillAmount)?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>

      <div className={styles.totalAmountDueWrapper}>
        <p className={styles.billAmountTitle}>{t('Total Amount Due')}</p>
        <p className={styles.billAmountValue}>
          <span className={styles.billAmountCurrency}>{currency} </span>{' '}
          {Number(totalAmountDue)?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    </>
  );
};
