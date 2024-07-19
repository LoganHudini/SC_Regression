import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import styles from './CheckInDrawer.module.scss';
import {
  getReservationForCheckinValidation,
  getReservationForConnectToRoomValidation,
} from 'validation/get-reservation.validation';
import { useFormik } from 'formik';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { activeCheckInFlow, useCheckedIn } from 'storage/check-in.storage';
import {
  hotelInfoStorage,
  toggleCheckInDetailsDrawer,
  toggleNotification,
} from 'storage/home.storage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { useRouter } from 'next/router';
import { getCheckInToken } from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { useConfig } from 'utils/hooks/useConfiguration';
import { getCheckOutToken } from 'core/api/functions/getCheckOutAuthentication';
import { handleReservation } from 'utils/fetchReservation';

const CheckInDrawer = (props: any) => {
  const { setErrorToggle } = props;
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
  const homeActiveRef = useRef<boolean>();

  useEffect(() => {
    homeActiveRef.current = router?.pathname === '/[locale]/[hotel]';
  }, [router?.pathname]);

  const activeCheckInFlowInfo = useReactiveVar(activeCheckInFlow);

  const [loading, setLoading] = useState(false);

  const goToTheNextStep = useCallback(
    async (values: any) => {
      await handleReservation({
        activeCheckInFlowInfo,
        values,
        hotelId,
        config,
        toggleNotification,
        setLoading,
        setErrorToggle,
        t,
        processStatusCode,
        goToTheNextStep,
        homeActiveRef,
        navigate,
      });
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
    </>
  );
};

export default CheckInDrawer;
