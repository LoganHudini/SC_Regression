import React from 'react';
import styles from './TotalBill.module.scss';
import { ITotalBillProps } from './TotalBill.types';
import { useTranslation } from 'react-i18next';
import { formatPrice } from 'utils/functions';

export const TotalBill: React.FC<ITotalBillProps> = ({
  totalAmountDue,
  totalBillAmount,
  currency,
}) => {
  const { t } = useTranslation(['bill']);

  return (
    <>
      <div className={styles.totalBillAmountWrapper}>
        <p className={styles.billAmountTitle}>{t('Total Bill Amount')}</p>
        <p className={styles.billAmountValue}>
          <span className={styles.billAmountCurrency}>{currency} </span>{' '}
          {formatPrice(totalBillAmount)}
        </p>
      </div>

      <div className={styles.totalAmountDueWrapper}>
        <p className={styles.billAmountTitle}>{t('Total Amount Due')}</p>
        <p className={styles.billAmountValue}>
          <span className={styles.billAmountCurrency}>{currency} </span>{' '}
          {formatPrice(totalAmountDue)}
        </p>
      </div>
    </>
  );
};
