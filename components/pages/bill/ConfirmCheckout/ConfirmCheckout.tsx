import cx from 'classnames';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import styles from './ConfirmCheckout.module.scss';
import { ConfirmCheckoutProps } from './ConfirmCheckout.types';
import { ApolloError } from '@apollo/client';
import { client } from 'core/graphql/client';
import { ICheckoutApiRequest, CHECKOUT } from 'core/graphql/queries/CHECKOUT';
import { ckeckoutTrip } from 'storage/trips.storage';
import { processError } from 'utils/processError';

export const ConfirmCheckout: React.FC<ConfirmCheckoutProps> = ({
  toggleOpened,
  opened,
  totalAmountDue,
  reservationType,
  reservationId,
  bookingId,
}) => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation(['bill', 'common']);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    if (Number(totalAmountDue) === 0) {
      setIsLoading(true);
      try {
        const checkoutPayload: ICheckoutApiRequest = {
          reservationType,
          reservationId,
          bookingId,
          paymentType: 'OPIVA',
        };

        await client.query({
          query: CHECKOUT,
          context: { clientName: 'rest' },
          variables: {
            body: checkoutPayload,
          },
        });

        navigate(availablePaths.CHECKOUT_CONFIRMATION);
        ckeckoutTrip({ reservationId });
      } catch (error) {
        console.error(error);
        processError(t, error as ApolloError);
      }
      setIsLoading(false);
    } else {
      navigate(availablePaths.CHECKOUT_PAYMENT);
    }
  }, [bookingId, navigate, reservationId, reservationType, t, totalAmountDue]);

  return (
    <>
      <div
        onClick={toggleOpened}
        className={cx(styles.confirmCheckoutBackground, {
          [styles.confirmCheckoutBackgroundOpened]: opened,
        })}
      />
      <div
        className={cx(styles.confirmCheckoutWrapper, {
          [styles.confirmCheckoutWrapperOpened]: opened,
        })}
      >
        <h2 className={styles.confirmCheckoutTitle}>{t('Confirm Check-out?')}</h2>
        <p className={styles.text}>
          {t(
            'This action cannot be reversed. Your room access & digital room key will be disabled after Check-out.',
          )}
        </p>
        <div className={styles.buttons}>
          <StyledButton
            disabled={isLoading}
            onClick={toggleOpened}
            className={styles.button}
            variant='outlined'
          >
            {t('No')}
          </StyledButton>
          <StyledButton
            loading={isLoading}
            onClick={onSubmit}
            className={styles.button}
            variant='contained'
          >
            {t('Yes')}
          </StyledButton>
        </div>
      </div>
    </>
  );
};
