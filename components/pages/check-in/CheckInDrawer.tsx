import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useState } from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import styles from './CheckInDrawer.module.scss';
import { IGetPrecheckinReservationData } from 'types/get-reservation.types';
import { getReservationValidation } from 'validation/get-reservation.validation';
import { useFormik } from 'formik';
import { GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import { processError } from 'utils/processError';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { availablePaths } from 'utils/availablePaths';
import { toast } from 'react-toastify';
import { checkinStorage } from 'storage/check-in.storage';
import { toggleCheckInDrawer, toggleDetailsDrawer } from 'storage/home.storage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';

const CheckInDrawer = () => {
  const navigate = useLocalizedRouter();
  const checkInDrawerStatus = useReactiveVar(toggleCheckInDrawer);
  const { t } = useTranslation(['get-reservation', 'common']);

  const [loading, setLoading] = useState(false);

  const goToTheNextStep = useCallback(
    async (values: IGetPrecheckinReservationData) => {
      try {
        setLoading(true);
        const { data } = await client.query({
          query: GET_RESERVATION,
          context: { clientName: 'rest' },
          variables: {
            confirmationNumber: values?.confirmationNumber,
            lastName: values?.lastName,
          },
          fetchPolicy: 'no-cache',
        });

        if (data) {
          client.writeQuery({
            query: GET_RESERVATION,
            data,
          });

          // if (
          //   data.getReservation.data.reservationStatus === 'CANCELED' ||
          //   data.getReservation.data.reservationStatus === 'CHKOUT' ||
          //   data.getReservation.data.reservationStatus === 'CHECKEDOUT'
          // ) {
          //   toast(t('No Reservation Found'), { type: 'error' });
          //   checkinStorage({
          //     reservationId: data.getReservation.data.confirmationId as string,
          //     checkedIn: false,
          //     preCheckedIn: false,
          //   });
          //   setLoading(false);
          // } else if (data.getReservation.data.reservationStatus === 'INHOUSE') {
          //   toast(t('Checked In Successfully'), { type: 'success' });
          //   checkinStorage({
          //     reservationId: data.getReservation.data.confirmationId as string,
          //     checkedIn: true,
          //     preCheckedIn: true,
          //     bookingId: data.getReservation.data.reservationId,
          //   });
          //   navigate(availablePaths?.HOME);
          // } else {
          toggleCheckInDrawer(false);
          navigate(availablePaths?.GUEST_INFORMATION_INPUT);
          // }
        }
      } catch (error) {
        processError(t, error as ApolloError);
        setLoading(false);
      }
    },
    [navigate, t],
  );

  const formik = useFormik({
    initialValues: {
      confirmationNumber: '',
      lastName: '',
    },
    validationSchema: getReservationValidation,
    onSubmit: goToTheNextStep,
  });

  const closeInputDrawer = useCallback(() => {
    toggleCheckInDrawer(false);
    navigate(availablePaths.HOME);
  }, [navigate]);

  const checkInDetails = () => {
    return (
      <>
        <PageWrapper className={styles.pageWrapper}>
          <p className={styles.pageTitle}>
            {t('Please enter the details to start your check-in process')}
          </p>
          <div className={styles.reservationInputs}>
            <StyledInput
              autoComplete='off'
              required
              className={styles.reservationInput}
              label={t('Last Name')}
              variant='standard'
              name='lastName'
              id='lastName'
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched?.lastName && formik.errors.lastName}
            />
            <StyledInput
              autoComplete='off'
              required
              className={styles.reservationInput}
              label={t('Reservation ID')}
              variant='standard'
              name='confirmationNumber'
              id='confirmationNumber'
              type={'number'}
              value={formik.values.confirmationNumber}
              onChange={formik.handleChange}
              error={formik.touched.confirmationNumber && Boolean(formik.errors.confirmationNumber)}
              helperText={formik.touched?.confirmationNumber && formik.errors.confirmationNumber}
            />
          </div>
          <StyledButton
            loading={loading}
            disabled={loading}
            className={styles.findMyBookingBtn}
            onClick={formik.submitForm}
          >
            {t('NEXT')}
          </StyledButton>
        </PageWrapper>
      </>
    );
  };

  return (
    <>
      <CustomDrawer
        open={checkInDrawerStatus}
        onClose={closeInputDrawer}
        content={checkInDetails()}
      />
    </>
  );
};

export default CheckInDrawer;
