import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import styles from './CheckInDrawer.module.scss';
import {
  getReservationForCheckinValidation,
  getcheckInTokenValidation,
  getReservationForConnectToRoomValidation,
} from 'validation/get-reservation.validation';
import { useFormik } from 'formik';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { activeCheckInFlow, activeCheckOutFlow, useCheckedIn } from 'storage/check-in.storage';
import {
  hotelInfoStorage,
  toggleCheckInDetailsDrawer,
  toggleNotification,
} from 'storage/home.storage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { useRouter } from 'next/router';
import { processStatusCode } from 'utils/processError';
import { useConfig } from 'utils/hooks/useConfiguration';
import { handleCheckInToken, handleReservation } from 'utils/fetchReservation';

export interface Values {
  confirmationNumber?: string | string[];
  roomNo?: string | string[];
  lastName?: string | string[];
}

const CheckInDrawer = () => {
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotel = config?.code;
  const pmsRoomNumberLength = config?.pmsRoomNumberLength;
  const hotelInformation = useReactiveVar(hotelInfoStorage);
  const checkInDrawerStatus = useReactiveVar(toggleCheckInDetailsDrawer);
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const HOME = `/${hotel}/`;
  const resId = router?.query?.resId ?? '';
  const lastName = router?.query?.lastName ?? '';
  const roomNo = router?.query?.roomNo ?? '';
  const checkedInData = useCheckedIn();
  const homeActiveRef = useRef<boolean>();

  useEffect(() => {
    homeActiveRef.current = router?.pathname === '/[locale]/[hotel]';
  }, [router?.pathname]);

  const activeCheckInFlowInfo = useReactiveVar(activeCheckInFlow);
  const activeCheckOutFlowInfo = useReactiveVar(activeCheckOutFlow);

  const [loading, setLoading] = useState(false);
  const isRetryEnabled = config?.retryEnabled;

  const goToTheNextStep = useCallback(
    async (values: Values) => {
      if (activeCheckOutFlowInfo) {
        await handleCheckInToken({
          values,
          checkedInData,
          t,
          setLoading,
          navigate,
        });
      } else {
        await handleReservation({
          activeCheckInFlowInfo,
          values,
          hotelId,
          config,
          toggleNotification,
          setLoading,
          t,
          processStatusCode,
          goToTheNextStep,
          homeActiveRef,
          navigate,
          isRetryEnabled,
          hotelInformation,
          pmsRoomNumberLength
        });
      }
    },
    [
      activeCheckInFlowInfo,
      isRetryEnabled,
      hotelInformation,
      activeCheckOutFlowInfo,
      checkedInData,
      config,
      hotelId,
      navigate,
      t,
    ],
  );

  const formik = useFormik({
    initialValues:
      activeCheckInFlowInfo && !activeCheckOutFlowInfo
        ? {
          confirmationNumber: '',
          lastName: '',
        }
        : activeCheckOutFlowInfo
          ? { confirmationNumber: '' }
          : {
            roomNo: '',
            lastName: '',
          },
    validationSchema:
      activeCheckInFlowInfo && !activeCheckOutFlowInfo
        ? getReservationForCheckinValidation
        : activeCheckOutFlowInfo
          ? getcheckInTokenValidation
          : getReservationForConnectToRoomValidation,
    onSubmit: goToTheNextStep,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (resId && lastName && activeCheckInFlowInfo) {
      const values = {
        confirmationNumber: resId,
        lastName: lastName,
      };
      formik.setValues({
        ...formik.values,
        ['lastName' as string]: lastName,
        ['confirmationNumber' as string]: resId,
      });
      toggleCheckInDetailsDrawer(true);
      goToTheNextStep(values);
    } else if (roomNo && lastName && !activeCheckInFlowInfo) {
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
            {t('Get Started')}
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
            {activeCheckInFlowInfo && !activeCheckOutFlowInfo
              ? t('Please enter the details to start your check-in process')
              : activeCheckOutFlowInfo
                ? t('Please enter the details to proceed')
                : t('Connect your phone to access in-room features on your device.')}
          </p>
          <div className={styles.reservationInputs}>
            <StyledInput
              autoComplete='off'
              required
              className={styles.reservationInput}
              label={
                activeCheckInFlowInfo || activeCheckOutFlowInfo ? t('Booking ID') : t('Room No')
              }
              variant='standard'
              name={
                activeCheckInFlowInfo || activeCheckOutFlowInfo ? 'confirmationNumber' : 'roomNo'
              }
              id={activeCheckInFlowInfo || activeCheckOutFlowInfo ? 'confirmationNumber' : 'roomNo'}
              value={
                (activeCheckInFlowInfo || activeCheckOutFlowInfo
                  ? formik.values.confirmationNumber ?? ''
                  : formik.values.roomNo) ?? ''
              }
              onChange={formik.handleChange}
              error={
                activeCheckInFlowInfo || activeCheckOutFlowInfo
                  ? formik.touched.confirmationNumber && Boolean(formik.errors.confirmationNumber)
                  : formik.touched.roomNo && Boolean(formik.errors.roomNo)
              }
              helperText={
                activeCheckInFlowInfo || activeCheckOutFlowInfo
                  ? formik.touched?.confirmationNumber && formik.errors.confirmationNumber
                    ? t(formik.errors.confirmationNumber)
                    : null
                  : formik.touched?.roomNo && formik.errors.roomNo
                    ? t(formik.errors.roomNo)
                    : null
              }
            />
            {!activeCheckOutFlowInfo && (
              <StyledInput
                autoComplete='off'
                required
                className={styles.reservationInput}
                label={t('Last Name')}
                variant='standard'
                name='lastName'
                id='lastName'
                value={formik.values.lastName ?? ''}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={
                  formik.touched?.lastName && formik.errors.lastName
                    ? t(formik.errors.lastName)
                    : null
                }
              />
            )}
            <StyledButton
              loading={loading}
              className={styles.findMyBookingBtn}
              onClick={formik.submitForm}
            >
              {activeCheckInFlowInfo || activeCheckOutFlowInfo ? t('Next') : t('Connect to Room')}
            </StyledButton>
          </div>
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
          !activeCheckInFlowInfo && checkedInData?.checkedIn && !activeCheckOutFlowInfo
            ? pairDeviceWelcomeMessage()
            : checkInDetails()
        }
      />
    </>
  );
};

export default CheckInDrawer;
