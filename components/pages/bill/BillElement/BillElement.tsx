import { CURRENCY } from 'core/graphql/endpoints';
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
      <div className={styles.infoColumn}>
        {chequeNo && <div className={styles.chequeNo}>{`CHEQUE NO: ${chequeNo}`}</div>}
        <div className={styles.price}>
          <span className={styles.billAmountCurrency}>{CURRENCY} </span>
          {price}
        </div>
      </div>
    </div>
  );
};
