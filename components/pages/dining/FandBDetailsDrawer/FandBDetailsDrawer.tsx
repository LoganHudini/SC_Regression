import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import { IFandBDetailsProps } from './FandBDetailsDrawer.types';
import styles from './FandBDetailsDrawer.module.scss';
import {
  CheckinDetailsValidation,
  CheckinDetailsValidationWithoutRoomNo,
} from 'validation/FandBDetailsDrawer.validation';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import HotelLogo from '@icons/f&bhotellogo.svg';
import { PAYMENT } from 'utils/constants';
import { guestNameFandB, guestPhoneNoFandB, guestRoomNoFandB } from 'utils/functions';

export const FandBDetailsDrawer: React.FC<IFandBDetailsProps> = ({
  opened,
  toggleOpened,
  restOrder,
  paymentSelected,
}) => {
  const { t } = useTranslation(['common']);
  const [loading, setLoading] = useState(false);
  const name = guestNameFandB() as string;
  const phoneNo = guestPhoneNoFandB() as string;
  const roomNo = guestRoomNoFandB() as string;

  const goToNextPage = () => {
    gotoThankyoupage();
  };

  const formik = useFormik({
    initialValues: {
      name: name ?? '',
      roomNumber: roomNo ?? '',
      phoneNumber: phoneNo ?? '+',
    },
    validationSchema:
      paymentSelected === PAYMENT[0]?.name
        ? CheckinDetailsValidation
        : CheckinDetailsValidationWithoutRoomNo,
    onSubmit: goToNextPage,
  });

  const gotoThankyoupage = useCallback(async () => {
    setLoading(true);
    localStorage.setItem(
      'FandB_guestDetails',
      JSON.stringify({
        name: formik.values.name,
        phoneNumber: formik.values.phoneNumber,
        roomNumber: formik.values.roomNumber,
      }) ?? '',
    );
    restOrder();
    toggleOpened();
    setLoading(false);
  }, [
    formik.values.name,
    formik.values.phoneNumber,
    formik.values.roomNumber,
    restOrder,
    toggleOpened,
  ]);

  return (
    <div>
      <div
        onClick={toggleOpened}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      ></div>
      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: opened })}>
        <div className={styles.confirmationWrapper}>
          <HotelLogo />
          <h2 className={styles.title}>{t('Table No')}</h2>
          <h2 className={styles.tableNo}>
            {(typeof window !== 'undefined' &&
              localStorage.getItem('tableNumber') &&
              JSON.parse(localStorage.getItem('tableNumber') ?? '')) ??
              ''}
          </h2>
          <p className={styles.formTitle}>{t('Please fill your details')}</p>
          <div className={styles.totalRequestsWrapper}>
            <StyledInput
              required
              autoComplete='off'
              className={styles.guestDataInput}
              label={t('Name')}
              variant='standard'
              name={'name'}
              id={'name'}
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik?.touched?.name && Boolean(formik?.errors?.name)}
              helperText={formik?.errors?.name && t(`${formik?.errors?.name}`)}
            />
            {/* <div className={styles.checkBoxWrapper}>
              <StyledCheckBox onClick={toggleConditionsAccepted} value={conditionsAccepted} />
              <p className={styles.guest}>{t('Are you a hotel guest?')}</p>
            </div> */}
            {paymentSelected === PAYMENT[0]?.name ? (
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
            ) : (
              <StyledInput
                required
                autoComplete='off'
                type='tel'
                className={styles.guestDataInput}
                label={t('Phone Number')}
                inputProps={{ maxLength: 15 }}
                variant='standard'
                name={'phoneNumber'}
                id={'phoneNumber'}
                value={formik?.values?.phoneNumber}
                onChange={formik.handleChange}
                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                helperText={formik.errors?.phoneNumber && t(`${formik?.errors?.phoneNumber}`)}
              />
            )}
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
