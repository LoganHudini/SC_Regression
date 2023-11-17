import dayjs from 'dayjs';
import React from 'react';
import { timeFormats } from 'utils/timeFormats';
import styles from './BillElement.module.scss';
import { IBIllElementProps } from './BillElement.types';

export const BillElement: React.FC<IBIllElementProps> = ({ date, title, chequeNo, price }) => {
  return (
    <div className={styles.billElement}>
      <div className={styles.infoColumn}>
        <div className={styles.time}>{dayjs(date).format(timeFormats?.DAY_MONTH_YEAR)}</div>
        <div className={styles.title}>{title}</div>
      </div>
      <div className={chequeNo ? styles.infoColumn : styles?.infoColumnWithoutCheque}>
        {chequeNo && <div className={styles.chequeNo}>{`CHEQUE NO: ${chequeNo}`}</div>}
        <div className={styles.price}>
          <span className={styles.billAmountCurrency}>{price?.split(' ')[0]} </span>
          {Number(price?.split(' ')[1])?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
};
