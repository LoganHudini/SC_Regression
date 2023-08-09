import React from 'react';
import styles from './PaymentLoader.module.scss';
import CreditCard from '@icons/creditCard.svg';

export const PaymentLoader: React.FC = () => {
  return (
    <div className={styles.paymentLoader}>
      <div className={styles.paymentLoaderInner}>
        <div className={styles.ldsSpinner}>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>

        <CreditCard className={styles.creditCard} />
        <p className={styles.paymentLoaderText}>Please wait, while we process your payment.</p>
      </div>
    </div>
  );
};
