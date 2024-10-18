import dayjs from 'dayjs';
import React from 'react';
import { timeFormats } from 'utils/timeFormats';
import styles from './BillElement.module.scss';
import { IBIllElementProps } from './BillElement.types';
import { useTranslation } from 'react-i18next';
import { formatPrice } from 'utils/functions';
import { useCurrency } from 'utils/hooks/useCurrency';
import { useConfig } from 'utils/hooks/useConfiguration';
import { INFOR } from 'utils/constants';

export const BillElement: React.FC<IBIllElementProps> = ({ date, title, chequeNo, price }) => {
  const { t } = useTranslation(['bill']);
  const config = useConfig();
  const currency = useCurrency();

  return (
    <div className={styles.billElement}>
      <div className={styles.infoColumn}>
        <div className={styles.time}>{dayjs(date).format(timeFormats?.DAY_MONTH_YEAR)}</div>
        <div className={styles.title}>{title}</div>
      </div>
      <div className={chequeNo ? styles.infoColumn : styles?.infoColumnWithoutCheque}>
        {chequeNo && <div className={styles.chequeNo}>{`${t('CHEQUE NO:')} ${chequeNo}`}</div>}
        {config?.pms === INFOR ? (
          <div className={styles.price}>
            <span className={styles.billAmountCurrency}>{currency} </span>
            {formatPrice(price)}
          </div>
        ) : (
          <div className={styles.price}>
            <span className={styles.billAmountCurrency}>{price?.split(' ')[0]} </span>
            {formatPrice(price?.split(' ')[1])}
          </div>
        )}
      </div>
    </div>
  );
};
