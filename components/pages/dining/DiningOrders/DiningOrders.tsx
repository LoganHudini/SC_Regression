import React from 'react';
import styles from './DiningOrders.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { IDiningOrdersProps } from './DiningOrders.types';
import { useTranslation } from 'react-i18next';

export const DiningOrders: React.FC<IDiningOrdersProps> = ({ openOrdersDrawer, ordersData }) => {
  const { t } = useTranslation('dining');
  const orderId = ordersData[ordersData?.length - 1]?.id?.slice(0, 6);

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleRow}>
        <p className={styles.title}>{t('Current Order')}</p>
        <p className={styles.id}>{`${orderId}`}</p>
      </div>
      <div className={styles.secondRow}>
        <p className={styles.items}>
          {ordersData?.length} {ordersData?.length === 1 ? t('order') : t('orders')}
        </p>
        <StyledButton variant='contained' className={styles.myOrders} onClick={openOrdersDrawer}>
          {t('My Orders')}
        </StyledButton>
      </div>
    </div>
  );
};
