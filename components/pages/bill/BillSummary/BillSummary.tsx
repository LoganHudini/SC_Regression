import React from 'react';
import ArrowForwardIcon from '@icons/ArrowForward.svg';
import styles from './BillSummary.module.scss';
import { IBillSummaryProps } from './BillSummary.types';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';

export const BillSummary: React.FC<IBillSummaryProps> = ({
  checkInDate,
  checkOutDate,
  roomNumber,
}) => {
  return (
    <div className={styles.staySummary}>
      <div className={styles.staySummaryInner}>
        <div className={styles.staySummaryColumn}>
          <h3 className={styles.staySummaryColumnTitle}>Check in date</h3>
          <p className={styles.staySummaryColumnValue}>
            {dayjs(checkInDate).format(timeFormats.WEEKDAY_DAY_MONTH_YEAR)}
          </p>
        </div>
        <ArrowForwardIcon className={styles.arrow} />
        <div className={styles.staySummaryColumn}>
          <h3 className={styles.staySummaryColumnTitle}>Check out date</h3>
          <p className={styles.staySummaryColumnValue}>
            {dayjs(checkOutDate).format(timeFormats.WEEKDAY_DAY_MONTH_YEAR)}
          </p>
        </div>
        <div className={styles.staySummaryColumn}>
          <h3 className={styles.staySummaryColumnTitle}>Room No</h3>
          <p className={styles.staySummaryColumnValue}>{roomNumber}</p>
        </div>
      </div>
    </div>
  );
};
