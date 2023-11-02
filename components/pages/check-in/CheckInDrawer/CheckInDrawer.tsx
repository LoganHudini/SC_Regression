import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useState } from 'react';
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
import { toggleCheckInDetailsDrawer, toggleNotification } from 'storage/home.storage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { saveTrip } from 'storage/trips.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { useRouter } from 'next/router';
import { useConfig } from 'utils/hooks/useConfiguration';

const CheckInDrawer = () => {
  const navigate = useLocalizedRouter();
  const hotelId = useConfig()?.hotelId;
  const hotel = useConfig()?.code;
  const checkInDrawerStatus = useReactiveVar(toggleCheckInDetailsDrawer);
  const { t } = useTranslation(['get-reservation', 'common']);
  const router = useRouter();
  const HOME = `/${hotel}/`;

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
            hotelId: hotelId,
          },
          fetchPolicy: 'no-cache',
        });

        if (data) {
          client.writeQuery({
            query: GET_RESERVATION,
            data,
          });

          const roomNo = data?.getReservation?.data?.roomTypes[0]?.roomNumber;

          if (
            data.getReservation.data.reservationStatus === 'CANCELED' ||
            data.getReservation.data.reservationStatus === 'CHKOUT' ||
            data.getReservation.data.reservationStatus === 'CHECKEDOUT'
          ) {
            toast(t('No Reservation Found'), { type: 'error' });
            checkinStorage({
              reservationId: data.getReservation.data.confirmationId as string,
              checkedIn: false,
              preCheckedIn: false,
            });
            setLoading(false);
          } else if (data.getReservation.data.reservationStatus === 'INHOUSE') {
            toggleNotification(true);
            saveTrip({
              reservationId: data?.getReservation?.data?.confirmationId as string,
              preCheckedIn: !roomNo ? true : false,
              checkedIn: roomNo ? true : false,
              name: data?.getReservation?.data?.lastName,
              email: data?.getReservation?.data?.emails,
              roomNumber: roomNo,
              invoiceId: data?.getReservation?.data?.reservationId as string,
            });
            checkinStorage({
              reservationId: data?.getReservation?.data?.confirmationId as string,
              preCheckedIn: !roomNo ? true : false,
              checkedIn: roomNo ? true : false,
              name: data?.getReservation?.data?.lastName,
              email: data?.getReservation?.data?.emails,
              roomNumber: roomNo,
              invoiceId: data?.getReservation?.data?.reservationId as string,
            });

            navigate(HOME);
            toggleCheckInDetailsDrawer(false);
            setLoading(false);
          } else {
            navigate(availablePaths?.GUEST_INFORMATION_INPUT);
            toggleCheckInDetailsDrawer(false);
            setLoading(false);
          }
        }
      } catch (error) {
        processError(t, error as ApolloError);
        setLoading(false);
      }
    },
    [HOME, hotelId, navigate, t],
  );

  const resId = router?.query?.resId ?? '';
  const lastName = router?.query?.lastName ?? '';

  const openCheckInDrawer = () => {
    if (resId && lastName) {
      updateFieldValue();
      toggleCheckInDetailsDrawer(true);
    }
  };

  const updateFieldValue = () => {
    formik.setValues({
      ...formik.values,
      ['lastName' as string]: lastName,
      ['confirmationNumber' as string]: resId,
    });
  };

  useEffect(() => {
    openCheckInDrawer();
  }, [resId, lastName]);

  const formik = useFormik({
    initialValues: {
      confirmationNumber: '',
      lastName: '',
    },
    validationSchema: getReservationValidation,
    onSubmit: goToTheNextStep,
  });

  const closeInputDrawer = useCallback(() => {
    toggleCheckInDetailsDrawer(false);
    navigate(HOME);
  }, [HOME, navigate]);

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
              label={t('Booking ID')}
              variant='standard'
              name='confirmationNumber'
              id='confirmationNumber'
              value={formik.values.confirmationNumber}
              onChange={formik.handleChange}
              error={formik.touched.confirmationNumber && Boolean(formik.errors.confirmationNumber)}
              helperText={formik.touched?.confirmationNumber && formik.errors.confirmationNumber}
            />
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
          </div>
          <StyledButton
            loading={loading}
            className={styles.findMyBookingBtn}
            onClick={formik.submitForm}
            arrow
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
      <Notification
        title={t('Hello Again!') as string}
        description={
          t(
            'Reservation validated successfully. You can now explore our in-stay services.',
          ) as string
        }
        redirect={HOME}
        type='success'
      />
    </>
  );
};

export default CheckInDrawer;
