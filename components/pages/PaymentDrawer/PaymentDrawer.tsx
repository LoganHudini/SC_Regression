import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import { PaymentDrawerProps } from './PaymentDrawer.types';
import styles from './PaymentDrawer.module.scss';

import { useTranslation } from 'react-i18next';

import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { PAYMENT } from 'utils/constants';
import { IPaymentType } from '../dining-menu/DiningOrdersDrawer/DiningOrdersDrawer.types';
import Drawer from '@mui/material/Drawer';

export const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  opened,
  toggleOpened,
  restOrder,
  setpaymentType,
}) => {
  const { t } = useTranslation(['housekeeping', 'common', 'check-in']);
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<IPaymentType>();

  const handleBillSelection = (id: string) => {
    const item = PAYMENT?.find((item) => item.id === id);
    if (item) setPaymentType(item);
  };
  const handleConfirm = useCallback(() => {
    setpaymentType(paymentType);
    toggleOpened();
  }, [paymentType]);
  return (
    <Drawer
      variant='temporary'
      anchor='bottom'
      open={opened}
      onClose={toggleOpened}
      PaperProps={{
        elevation: 0,
        style: {
          borderTopRightRadius: '2rem',
          borderTopLeftRadius: '2rem',
          maxWidth: '772px',
          margin: 'auto',
          maxHeight: '70vh',
        },
      }}
    >
      <div className={styles.myOrdersWrapper}>
        <h3 className={styles.heading}>{t('Payment Method')}</h3>
        {PAYMENT?.map((item) => (
          <StyledButton
            key={item.id}
            variant={item.id === paymentType?.id ? 'contained' : 'outlined'}
            className={styles.buttonPayment}
            onClick={() => handleBillSelection(item?.id)}
          >
            {item?.name}
          </StyledButton>
        ))}

        <StyledButton
          variant='contained'
          className={styles.buttonConfirm}
          onClick={handleConfirm}
          disabled={!paymentType}
        >
          {t(' Confirm')}
        </StyledButton>
      </div>
    </Drawer>
  );
};
