import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { IPreCheckinGuestInfoProps } from './PreCheckinGuestInfo.types';
import styles from './PreCheckinGuestInfo.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { IGuestInfo } from 'types/guest-information.types';
import { identityVerificationValidation } from 'validation/guest-information-input.validation';
import { ChangeEvent, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import {
  IReservationGuestInfoStorageData,
  reservationGuestInfoStorageData,
} from 'storage/reservation-guest-info.storage';

export const PreCheckinGuestInfo: React.FC<IPreCheckinGuestInfoProps> = ({ selectedGuest }) => {
  const { t } = useTranslation('check-in');
  const [cardOpened, setCardOpened] = useState(true);
  const handleInputChange = () => {
    setCardOpened(!cardOpened);
  };
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const updateGuestDetails = (name: string, value: string) => {
    const inputField = name;
    const inputValue = value;
    reservationGuestInfoStorageData({ ...guestReservationInfo, [inputField]: inputValue });
  };
  const formik = useFormik({
    initialValues: selectedGuest as IReservationGuestInfoStorageData,
    validationSchema: identityVerificationValidation,
    onSubmit: handleInputChange,
  });

  return (
    <div className={styles.identityInputs}>
      <div>
        <div className={styles.col_100}>
          <StyledInput
            required
            autoComplete='off'
            className={styles.guestDataInput}
            label={t('First Name')}
            variant='standard'
            name={'firstName'}
            id={'firstName'}
            value={formik.values?.firstName}
            disabled={true}
            onChange={(e) => {
              formik.handleChange(e);
              updateGuestDetails(e.target.id, e.target.value);
            }}
          />
        </div>
      </div>
      <div>
        <div className={styles.col_100}>
          <StyledInput
            required
            autoComplete='off'
            className={styles.guestDataInput}
            label={t('Last Name')}
            variant='standard'
            name={'lastName'}
            id={'lastName'}
            value={formik.values?.lastName}
            disabled={true}
            onChange={(e) => {
              formik.handleChange(e);
              updateGuestDetails(e.target.id, e.target.value);
            }}
          />
        </div>
      </div>
      <div>
        <div className={styles.col_100}>
          <StyledInput
            required
            autoComplete='off'
            className={styles.guestDataInput}
            label={t('Email')}
            variant='standard'
            name={'email'}
            id={'emails'}
            value={formik.values?.email}
            onChange={(e) => {
              formik.handleChange(e);
              updateGuestDetails('email', e.target.value);
            }}
            onFocus={() => formik.setFieldTouched('email', true)}
            error={Boolean(formik.touched.email) && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </div>
      </div>
      <div>
        <div className={styles.col_100}>
          <StyledInput
            required
            autoComplete='off'
            className={styles.guestDataInput}
            label={t('Phone')}
            variant='standard'
            name={'phone'}
            id={'phone'}
            value={formik.values?.phone}
            onChange={(e) => {
              formik.handleChange(e);
              updateGuestDetails(e.target.id, e.target.value);
            }}
            onFocus={() => formik.setFieldTouched('phone', true)}
            error={Boolean(formik.touched.phone) && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </div>
      </div>
    </div>
  );
};
