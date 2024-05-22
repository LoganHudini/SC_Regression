import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { activeCheckInFlow, checkinStorage, useCheckedIn } from 'storage/check-in.storage';
import {
  hotelInfoStorage,
  toggleCheckInDetailsDrawer,
  toggleNotification,
} from 'storage/home.storage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { saveTrip } from 'storage/trips.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { useRouter } from 'next/router';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import {
  CANCELED,
  CHKOUT,
  FAILURE,
  NOSHOW,
  SUCCESS,
  NA,
  INHOUSE,
  CHECKEDOUT,
} from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';
import { getCheckOutToken } from 'core/api/functions/getCheckOutAuthentication';

const CheckInDrawer = () => {
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotel = config?.code;
  const hotelInformation = useReactiveVar(hotelInfoStorage);

  const checkInDrawerStatus = useReactiveVar(toggleCheckInDetailsDrawer);
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const HOME = `/${hotel}/`;
  const resId = router?.query?.resId ?? '';
  const lastName = router?.query?.lastName ?? '';
  const checkInToken = useRef<string>('');
  const checkOutToken = useRef<string>('');
  const roomNo = router?.query?.roomNo ?? '';
  const checkedInData = useCheckedIn();

  const activeCheckInFlowInfo = useReactiveVar(activeCheckInFlow);

  const [loading, setLoading] = useState(false);
  const [errorNotification, setErrorNotification] = useState<{
    state: boolean;
    title: string;
    description: string;
  }>({ state: false, title: '', description: '' });

  const goToTheNextStep = useCallback(
    async (values: IGetPrecheckinReservationData) => {
      try {
        setLoading(true);

        activeCheckInFlowInfo
          ? (checkInToken.current = await getCheckInToken(
              values?.confirmationNumber?.toString()?.trim(),
              values?.lastName?.toString()?.trim(),
            ))
          : (checkOutToken.current = await getCheckOutToken(
              values?.roomNo?.toString()?.trim(),
              values?.lastName?.toString()?.trim(),
            ));

        const { data } = await client.query({
          query: activeCheckInFlowInfo ? GET_RESERVATION : GET_RESERVATION_WITH_ROOM_NUMBER,
          context: {
            clientName: 'rest',
            headers: {
              Authorization:
                'Bearer ' + (activeCheckInFlowInfo ? checkInToken?.current : checkOutToken.current),
            },
          },
          variables: activeCheckInFlowInfo
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
            roomNo && config?.allowedRoomtypes && config?.allowedRoomtypes?.length > 0
              ? config?.allowedRoomtypes?.includes(data?.getReservation?.data?.roomTypes[0]?.code)
              : true
          ) {
            if (
              data.getReservation.data.reservationStatus === CANCELED ||
              data.getReservation.data.reservationStatus === CHKOUT ||
              data.getReservation.data.reservationStatus === CHECKEDOUT ||
              data.getReservation.data.reservationStatus === NOSHOW
            ) {
              setErrorNotification({
                state: true,
                title: t('Reservation Not Found'),
                description: t('Please proceed to the front desk for further assistance.'),
              });
              checkinStorage({
                reservationId: data.getReservation.data.confirmationId as string,
                checkedIn: false,
                preCheckedIn: false,
              });
              toggleNotification(true);
              toggleCheckInDetailsDrawer(false);
              setLoading(false);
            } else if (data.getReservation.data.reservationStatus === INHOUSE) {
              if (roomNo) {
                if (activeCheckInFlowInfo) {
                  setErrorNotification({
                    state: false,
                    title: t('Hello Again!'),
                    description: t(
                      'Reservation validated successfully. You can now explore our in-stay services.',
                    ),
                  });
                  toggleNotification(true);
                  toggleCheckInDetailsDrawer(false);
                } else toggleCheckInDetailsDrawer(true);
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
                  hotelId: hotelId,
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
                setLoading(false);
              } else {
                setErrorNotification({
                  state: true,
                  title: t('Room Unavailable'),
                  description: t('Please try after sometime'),
                });
                toggleNotification(true);
                toggleCheckInDetailsDrawer(false);
                setLoading(false);
              }
            } else {
              navigate(activeCheckInFlowInfo ? availablePaths?.CHECK_IN : availablePaths?.HOME);
              !activeCheckInFlowInfo &&
                (setErrorNotification({
                  state: true,
                  title: t('Oops! Check-In Incomplete!'),
                  description: t(
                    'Please complete your check-in at our front desk to connect your phone with the room.',
                  ),
                }),
                toggleNotification(true));
              toggleCheckInDetailsDrawer(false);
              setLoading(false);
            }
          } else {
            setErrorNotification({
              state: true,
              title: t('Invalid Room Type'),
              description: t('Please proceed to the front desk for further assistance.'),
            });
            toggleNotification(true);
            toggleCheckInDetailsDrawer(false);
            setLoading(false);
          }
        }
      } catch (error) {
        const statusCode = processStatusCode(error as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(goToTheNextStep, values)
          : (setErrorNotification({
              state: true,
              title: t('Reservation Not Found'),
              description: t('Please proceed to the front desk for further assistance.'),
            }),
            toggleNotification(true),
            toggleCheckInDetailsDrawer(false),
            setLoading(false));
      }
    },
    [activeCheckInFlowInfo, config?.allowedRoomtypes, hotelId, navigate, t],
  );

  const formik = useFormik({
    initialValues: activeCheckInFlowInfo
      ? {
          confirmationNumber: '',
          lastName: '',
        }
      : {
          roomNo: '',
          lastName: '',
        },
    validationSchema: activeCheckInFlowInfo
      ? getReservationForCheckinValidation
      : getReservationForConnectToRoomValidation,
    onSubmit: goToTheNextStep,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (resId && lastName && activeCheckInFlowInfo) {
      const values = { confirmationNumber: resId, lastName: lastName };
      formik.setValues({
        ...formik.values,
        ['lastName' as string]: lastName,
        ['confirmationNumber' as string]: resId,
      });
      checkInToken.current = getCheckInToken(resId as string, lastName as string);
      toggleCheckInDetailsDrawer(true);
      goToTheNextStep(values);
    } else if (roomNo && lastName && !activeCheckInFlowInfo) {
      const values = { roomNo: roomNo, lastName: lastName };
      formik.setValues({
        ...formik.values,
        ['lastName' as string]: lastName,
        ['roomNo' as string]: roomNo,
      });
      checkOutToken.current = getCheckOutToken(roomNo as string, lastName as string);
      toggleCheckInDetailsDrawer(true);
      goToTheNextStep(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastName, resId, roomNo]);

  const closeInputDrawer = useCallback(() => {
    toggleCheckInDetailsDrawer(false);
    navigate(HOME);
  }, [HOME, navigate]);

  const pairDeviceWelcomeMessage = () => {
    return (
      <>
        <PageWrapper className={styles.pageWrapper}>
          <div className={styles.letterWrapper}>
            {hotelInformation?.getPropertyDetailsByHotelId?.hotel?.wcMessage?.messageText && (
              <p className={styles.letterBody}>
                {hotelInformation?.getPropertyDetailsByHotelId?.hotel?.wcMessage?.messageText}
              </p>
            )}
          </div>
          <StyledButton
            loading={loading}
            className={styles.findMyBookingBtn}
            onClick={() => toggleCheckInDetailsDrawer(false)}
          >
            {t('GET STARTED')}
          </StyledButton>
        </PageWrapper>
      </>
    );
  };

  const checkInDetails = () => {
    return (
      <>
        <PageWrapper className={styles.pageWrapper}>
          <p className={styles.pageTitle}>
            {activeCheckInFlowInfo
              ? t('Please enter the details to start your check-in process')
              : t('Connect your phone to access in-room features on your device.')}
          </p>
          <div className={styles.reservationInputs}>
            <StyledInput
              autoComplete='off'
              required
              className={styles.reservationInput}
              label={activeCheckInFlowInfo ? t('Booking ID') : t('Room No')}
              variant='standard'
              name={activeCheckInFlowInfo ? 'confirmationNumber' : 'roomNo'}
              id={activeCheckInFlowInfo ? 'confirmationNumber' : 'roomNo'}
              value={
                activeCheckInFlowInfo ? formik.values.confirmationNumber : formik.values.roomNo
              }
              onChange={formik.handleChange}
              error={
                activeCheckInFlowInfo
                  ? formik.touched.confirmationNumber && Boolean(formik.errors.confirmationNumber)
                  : formik.touched.roomNo && Boolean(formik.errors.roomNo)
              }
              helperText={
                activeCheckInFlowInfo
                  ? formik.touched?.confirmationNumber && formik.errors.confirmationNumber
                    ? t(formik.errors.confirmationNumber)
                    : null
                  : formik.touched?.roomNo && formik.errors.roomNo
                  ? t(formik.errors.roomNo)
                  : null
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
              helperText={
                formik.touched?.lastName && formik.errors.lastName
                  ? t(formik.errors.lastName)
                  : null
              }
            />
          </div>
          <StyledButton
            loading={loading}
            className={styles.findMyBookingBtn}
            onClick={formik.submitForm}
          >
            {activeCheckInFlowInfo ? t('NEXT') : t('Connect to Room')}
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
        content={
          !activeCheckInFlowInfo && checkedInData?.reservationId
            ? pairDeviceWelcomeMessage()
            : checkInDetails()
        }
      />
      <Notification
        title={errorNotification?.title as string}
        description={errorNotification?.description as string}
        redirect={errorNotification.state && availablePaths?.HOME}
        type={errorNotification.state ? FAILURE : SUCCESS}
      />
    </>
  );
};

export default CheckInDrawer;
