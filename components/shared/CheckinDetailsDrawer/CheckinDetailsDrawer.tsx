import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import { ICheckinDetailsProps } from './CheckinDetailsDrawer.types';
import styles from './CheckinDetailsDrawer.module.scss';
import { StyledInput } from '../StyledInput/StyledInput';
import { StyledButton } from '../StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { IGetReservationDataValidation } from 'types/get-reservation.types';
import { CheckinDetailsValidation } from 'validation/checkinDetails.validation';
import { checkinStorage } from 'storage/check-in.storage';

export const CheckinDetails: React.FC<ICheckinDetailsProps> = ({
  opened,
  toggleOpened,
  setthankYouDrawerConfirm,
}) => {
  const { t } = useTranslation(['common']);
  const [loading, setLoading] = useState(false);
  const roomNumber =
    (typeof window !== 'undefined' &&
      localStorage.getItem('guestDetails') &&
      JSON.parse(localStorage.getItem('guestDetails') ?? '').roomNumber) ??
    '';
  const lastName =
    (typeof window !== 'undefined' &&
      localStorage.getItem('guestDetails') &&
      JSON.parse(localStorage.getItem('guestDetails') ?? '').name) ??
    '';

  const goToNextPage = useCallback(
    async (values: IGetReservationDataValidation) => {
      setLoading(true);

      localStorage.setItem(
        'guestDetails',
        JSON.stringify({
          name: values.lastName,
          roomNumber: values.roomNumber,
        }) ?? '',
      );
      checkinStorage({
        reservationId: values.reservationId,
        checkedIn: true,
      });
      setthankYouDrawerConfirm(() => true);
      toggleOpened();
      setLoading(false);
    },
    [setthankYouDrawerConfirm, toggleOpened],
  );

  const formik = useFormik({
    initialValues: {
      // condition: false,
      lastName: lastName ?? '',
      roomNumber: roomNumber ?? '',
      reservationId: '',
    },
    validationSchema: CheckinDetailsValidation,
    onSubmit: goToNextPage,
  });

  return (
    <div>
      <div
        onClick={toggleOpened}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      ></div>
      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: opened })}>
        <div className={styles.confirmationWrapper}>
          <h2 className={styles.title}>{t('Please fill your details')}</h2>
          <div className={styles.totalRequestsWrapper}>
            <StyledInput
              required
              autoComplete='off'
              className={styles.guestDataInput}
              label={t('Last Name')}
              variant='standard'
              name={'lastName'}
              id={'lastName'}
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.errors?.lastName && t(`${formik?.errors?.lastName}`)}
            />
            <StyledInput
              required
              type='number'
              autoComplete='off'
              className={styles.guestDataInput}
              label={t('Room Number')}
              variant='standard'
              name={'roomNumber'}
              id={'roomNumber'}
              value={formik.values?.roomNumber}
              onChange={formik.handleChange}
              error={formik.touched.roomNumber && Boolean(formik.errors.roomNumber)}
              helperText={formik.errors?.roomNumber && t(`${formik?.errors?.roomNumber}`)}
            />
            <div className={styles.buttonWrapper}>
              <StyledButton
                loading={loading}
                disabled={loading}
                className={styles.button}
                variant='contained'
                onClick={formik.submitForm}
              >
                {t('Confirm')}
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
