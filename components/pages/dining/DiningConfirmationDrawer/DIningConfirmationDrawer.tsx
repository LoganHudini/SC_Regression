import React from 'react';
import { IDIningConfirmationDrawerProps } from './DiningConfirmationDrawer.types';
import cx from 'classnames';
import styles from './DiningConfirmationDrawer.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';

export const DiningConfirmationDrawer: React.FC<IDIningConfirmationDrawerProps> = ({
  opened,
  toggleOpened,
}) => {
  const { t } = useTranslation('common');
  return (
    <div>
      <div
        onClick={toggleOpened}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      ></div>
      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: opened })}>
        <p className={styles.title}>{t('We have received your order!')}</p>
        <p className={styles.orderNo}>{t('Order number:')} 120097212</p>
        <div className={styles.orderDetails}>
          <div className={styles.itemName}>Belgium Waffles</div>
          <div className={styles.itemPrice}>X 1</div>
        </div>
        <div className={styles.description}>Calamansi, Coffee, Homemade Sausage ($10)</div>
        <div className={styles.orderDetails}>
          <div className={styles.itemName}>Belgium Waffles</div>
          <div className={styles.itemPrice}>X 1</div>
        </div>
        <div className={styles.description}>Calamansi, Coffee, Homemade Sausage ($10)</div>
        <p className={styles.guestNo}>
          {t('No of Guest(s)')}: <span className={styles.count}>04</span>
        </p>
        <div className={styles.container}>
          <div className={styles.roomInfoWrapper}>
            <div className={styles.roomDetails}>ROOM NO - 4032</div>
            <div className={styles.roomDetails}>John Smith</div>
          </div>
          <div className={styles.roomInfoWrapper}>
            <div className={styles.hotel}>Radisson Blu Dubai Waterfront</div>
            <div className={styles.date}>22 May -24 May (3 Days)</div>
          </div>
          <p className={styles.guest}>{t('NO OF GUESTS:')} 04</p>
        </div>
        <div className={styles.buttonWrapper}>
          <StyledButton variant='contained' className={styles.button}>
            {t('Confirm')}
          </StyledButton>
        </div>
      </div>
    </div>
  );
};
