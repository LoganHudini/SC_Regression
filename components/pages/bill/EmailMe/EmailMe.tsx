import cx from 'classnames';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import CheckMark from '@icons/checkMarkThin.svg';
import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { emailMeValidation } from 'validation/bill.validation';
import styles from './EmailMe.module.scss';
import { EmailMeProps } from './EmailMe.types';
import { EMAIL_INVOICE, IEmailInvoicePayload } from 'core/graphql/queries/EMAIL_INVOICE';
import { processError } from 'utils/processError';
import { ApolloError } from '@apollo/client';
import { client } from 'core/graphql/client';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';

export const EmailMe: React.FC<EmailMeProps> = ({
  toggleOpened,
  opened,
  reservationId,
  registeredGuest,
  email,
}) => {
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useLocalizedRouter();

  const { t } = useTranslation(['bill', 'common']);

  const onSubmit = useCallback(
    async (values: { email: string }) => {
      setIsLoading(true);
      const emailInvoicePayload: IEmailInvoicePayload = {
        email: values.email,
        reservationId,
        registeredGuest,
      };

      try {
        await client.query({
          query: EMAIL_INVOICE,
          context: { clientName: 'rest' },
          fetchPolicy: 'network-only',
          variables: {
            confirmationNumber: reservationId,
            body: emailInvoicePayload,
          },
        });
      } catch (getUpdatedReservationError) {
        processError(t, getUpdatedReservationError as ApolloError);
        navigate(availablePaths.INDEX);
      }

      setSuccess(true);
      setIsLoading(false);
    },
    [registeredGuest, reservationId, navigate, t],
  );

  const { resetForm, ...formik } = useFormik({
    initialValues: {
      email: email,
    },
    validationSchema: emailMeValidation,
    onSubmit: onSubmit,
  });

  useEffect(() => {
    if (opened) {
      setSuccess(false);
      resetForm();
    }
  }, [resetForm, opened]);

  return (
    <>
      <div
        onClick={toggleOpened}
        className={cx(styles.emailMeBackground, { [styles.emailMeBackgroundOpened]: opened })}
      />
      <div className={cx(styles.emailMeWrapper, { [styles.emailMeWrapperOpened]: opened })}>
        {!success ? (
          <>
            <h2 className={styles.emailMeTitle}>{t('Confirm Email ID')}</h2>
            <p className={styles.emailId}>{t('Email ID')}</p>
            <StyledInput
              className={styles.input}
              variant='standard'
              name='email'
              id='email'
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched?.email && formik.errors.email}
            />
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
                onClick={formik.submitForm}
                className={styles.button}
                variant='contained'
              >
                {t('Yes')}
              </StyledButton>
            </div>
          </>
        ) : (
          <>
            <div className={styles.successContainer}>
              <CheckMark className={styles.checkMark} />
              <p className={styles.successText}>
                {t('Your bill has been emailed to')}
                <br />
                {formik.values.email}
              </p>
              <StyledButton
                className={styles.succcessButton}
                onClick={toggleOpened}
                variant='contained'
              >
                {t('OK')}
              </StyledButton>
            </div>
          </>
        )}
      </div>
    </>
  );
};
