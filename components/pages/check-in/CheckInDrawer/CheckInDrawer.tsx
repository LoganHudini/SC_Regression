import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useState } from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import styles from './CheckInDrawer.module.scss';
import { IGetPrecheckinReservationData } from 'types/get-reservation.types';
import {
  getReservationForCheckinValidation,
  getReservationForConnectToRoomValidation,
} from 'validation/get-reservation.validation';
import { useFormik } from 'formik';
import {
  GET_RESERVATION,
  GET_RESERVATION_WITH_ROOM_NUMBER,
} from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { availablePaths } from 'utils/availablePaths';
import { checkinStorage } from 'storage/check-in.storage';
import { toggleCheckInDetailsDrawer, toggleNotification } from 'storage/home.storage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { saveTrip } from 'storage/trips.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { useRouter } from 'next/router';
import {
  CANCELED,
  CHECKEDOUT,
  CHECK_IN,
  CHKOUT,
  FAILURE,
  NOSHOW,
  SUCCESS,
  NA,
} from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';
import { Loader } from 'components/shared/Loaders/Loaders';
import { activeModule } from 'utils/functions';

const CheckInDrawer = () => {
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotel = config?.code;

  const checkInDrawerStatus = useReactiveVar(toggleCheckInDetailsDrawer);
  const { t } = useTranslation(['get-reservation', 'common']);
  const router = useRouter();
  const HOME = `/${hotel}/`;
  const resId = router?.query?.resId ?? '';
  const lastName = router?.query?.lastName ?? '';
  const roomNo = router?.query?.roomNo ?? '';

  const checkinModule: boolean = activeModule(config?.modules, CHECK_IN);

  const [loading, setLoading] = useState(false);
  const [errorNotification, setErrorNotification] = useState<{
    state: boolean;
    title: string;
    description: string;
    appoloErrorMessage?: any;
  }>({ state: false, title: '', description: '', appoloErrorMessage: '' });

  const goToTheNextStep = useCallback(
    async (values: IGetPrecheckinReservationData) => {
      try {
        setLoading(true);
        const { data } = await client.query({
          query: checkinModule ? GET_RESERVATION : GET_RESERVATION_WITH_ROOM_NUMBER,
          context: { clientName: 'rest' },
          variables: checkinModule
            ? {
                confirmationNumber: values?.confirmationNumber?.toString()?.trim(),
                lastName: values?.lastName?.toString()?.trim(),
                hotelId: hotelId,
              }
            : {
                roomNo: values?.roomNo?.toString()?.trim(),
                lastName: values?.lastName?.toString()?.trim(),
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
            data.getReservation.data.reservationStatus === CANCELED ||
            data.getReservation.data.reservationStatus === CHKOUT ||
            data.getReservation.data.reservationStatus === CHECKEDOUT ||
            data.getReservation.data.reservationStatus === NOSHOW
          ) {
            setErrorNotification({
              state: true,
              title: 'Reservation Not Found',
              description: 'Please proceed to the front desk for further assistance.',
            });
            checkinStorage({
              reservationId: data.getReservation.data.confirmationId as string,
              checkedIn: false,
              preCheckedIn: false,
            });
            toggleNotification(true);
            toggleCheckInDetailsDrawer(false);
            setLoading(false);
          } else if (data.getReservation.data.reservationStatus === 'INHOUSE') {
            setErrorNotification({
              state: false,
              title: 'Hello Again!',
              description:
                'Reservation validated successfully. You can now explore our in-stay services.',
            });
            toggleNotification(true);
            toggleCheckInDetailsDrawer(false);

            saveTrip({
              reservationId:
                data?.getReservation?.data?.confirmationId !== NA
                  ? (data?.getReservation?.data?.confirmationId as string)
                  : (data?.getReservation?.data?.uniqueBookingId as string),
              preCheckedIn: !roomNo ? true : false,
              checkedIn: roomNo ? true : false,
              name: data?.getReservation?.data?.details?.contactPerson?.lastName,
              email: data?.getReservation?.data?.details?.contactPerson?.email,
              roomNumber: roomNo,
              invoiceId: data?.getReservation?.data?.reservationId as string,
            });
            checkinStorage({
              reservationId:
                data?.getReservation?.data?.confirmationId !== NA
                  ? (data?.getReservation?.data?.confirmationId as string)
                  : (data?.getReservation?.data?.uniqueBookingId as string),
              preCheckedIn: !roomNo ? true : false,
              checkedIn: roomNo ? true : false,
              name: data?.getReservation?.data?.details?.contactPerson?.lastName,
              email: data?.getReservation?.data?.details?.contactPerson?.email,
              roomNumber: roomNo,
              invoiceId: data?.getReservation?.data?.reservationId as string,
              currency: data?.getReservation?.data?.details?.holdAmount?.currency,
            });
            navigate(HOME);
            toggleCheckInDetailsDrawer(false);
            setLoading(false);
          } else {
            navigate(checkinModule ? availablePaths?.CHECK_IN : availablePaths?.HOME);
            !checkinModule &&
              (setErrorNotification({
                state: true,
                title: 'Oops! Check-In Incomplete!',
                description:
                  'Please complete your check-in at our front desk to connect your phone with the room.',
              }),
              toggleNotification(true));
            toggleCheckInDetailsDrawer(false);
            setLoading(false);
          }
        }
      } catch (error) {
        setErrorNotification({
          state: true,
          title: 'Reservation Not Found',
          description: 'Please Try Again',
          appoloErrorMessage: error as ApolloError,
        });
        toggleNotification(true);
        toggleCheckInDetailsDrawer(false);
        setLoading(false);
      }
    },
    [HOME, checkinModule, hotelId, navigate],
  );

  const formik = useFormik({
    initialValues: checkinModule
      ? {
          confirmationNumber: '',
          lastName: '',
        }
      : {
          roomNo: '',
          lastName: '',
        },
    validationSchema: checkinModule
      ? getReservationForCheckinValidation
      : getReservationForConnectToRoomValidation,
    onSubmit: goToTheNextStep,
  });

  useEffect(() => {
    if (resId && lastName && checkinModule) {
      const values = { confirmationNumber: resId, lastName: lastName };
      formik.setValues({
        ...formik.values,
        ['lastName' as string]: lastName,
        ['confirmationNumber' as string]: resId,
      });
      toggleCheckInDetailsDrawer(true);
      goToTheNextStep(values);
    } else if (roomNo && lastName && !checkinModule) {
      const values = { roomNo: roomNo, lastName: lastName };
      formik.setValues({
        ...formik.values,
        ['lastName' as string]: lastName,
        ['roomNo' as string]: roomNo,
      });
      toggleCheckInDetailsDrawer(true);
      goToTheNextStep(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastName, resId, roomNo]);

  const closeInputDrawer = useCallback(() => {
    toggleCheckInDetailsDrawer(false);
    navigate(HOME);
  }, [HOME, navigate]);

  const checkInDetails = () => {
    return (
      <>
        {loading && <Loader />}
        <PageWrapper className={styles.pageWrapper}>
          <p className={styles.pageTitle}>
            {checkinModule
              ? t('Please enter the details to start your check-in process')
              : t('Connect your phone to access in-room features on your device.')}
          </p>
          <div className={styles.reservationInputs}>
            <StyledInput
              autoComplete='off'
              required
              className={styles.reservationInput}
              label={checkinModule ? t('Booking ID') : t('Room No')}
              variant='standard'
              name={checkinModule ? 'confirmationNumber' : 'roomNo'}
              id={checkinModule ? 'confirmationNumber' : 'roomNo'}
              value={checkinModule ? formik.values.confirmationNumber : formik.values.roomNo}
              onChange={formik.handleChange}
              error={
                checkinModule
                  ? formik.touched.confirmationNumber && Boolean(formik.errors.confirmationNumber)
                  : formik.touched.roomNo && Boolean(formik.errors.roomNo)
              }
              helperText={
                checkinModule
                  ? formik.touched?.confirmationNumber && formik.errors.confirmationNumber
                  : formik.touched?.roomNo && formik.errors.roomNo
              }
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
          >
            {checkinModule ? t('NEXT') : t('CONNECT TO ROOM')}
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
        title={errorNotification?.title as string}
        description={errorNotification?.description as string}
        redirect={errorNotification.state && availablePaths?.HOME}
        type={errorNotification.state ? FAILURE : SUCCESS}
        apolloError={errorNotification?.state && errorNotification?.appoloErrorMessage}
      />
    </>
  );
};

export default CheckInDrawer;
