import React from 'react';
import ArrowForwardIcon from '@icons/ArrowForward.svg';
import styles from './BillSummary.module.scss';
import { IBillSummaryProps } from './BillSummary.types';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';

export const BillSummary: React.FC<IBillSummaryProps> = ({
  checkInDate,
  checkOutDate,
  roomNumber,
}) => {
  const { t } = useTranslation(['bill']);

  return (
    <div className={styles.staySummary}>
      <div className={styles.staySummaryInner}>
        <div className={styles.staySummaryColumn}>
          <h3 className={styles.staySummaryColumnTitle}>{t('Check-In date')}</h3>
          <p className={styles.staySummaryColumnValue}>
            {dayjs(checkInDate).format(timeFormats.DAY_MONTH_YEAR_4)}
          </p>
        </div>
        <div className={styles.arrowWrapper}>
          <ArrowForwardIcon className={styles.arrow} />
          <div className={styles.staySummaryColumn}>
            <h3 className={styles.staySummaryColumnTitle}>{t('Checkout date')}</h3>
            <p className={styles.staySummaryColumnValue}>
              {dayjs(checkOutDate).format(timeFormats.DAY_MONTH_YEAR_4)}
            </p>
          </div>
        </div>

        <div className={styles.staySummaryColumn}>
          <h3 className={styles.staySummaryColumnTitle}>{t('Room No')}</h3>
          <p className={cx(styles.staySummaryColumnValue, styles.align)}>{roomNumber}</p>
        </div>
      </div>
    </div>
  );
};
