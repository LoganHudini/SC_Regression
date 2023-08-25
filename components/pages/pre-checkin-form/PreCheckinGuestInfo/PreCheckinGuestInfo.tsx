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
import * as yup from 'yup';
import { email, phone, phoneRegex } from 'utils/constants';

export const PreCheckinGuestInfo: React.FC<IPreCheckinGuestInfoProps> = ({
  selectedGuest,
  guestInformationSection,
}) => {
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
  const initialFieldValues = guestInformationSection.reduce((values: any, field: any) => {
    values[field?.name] = selectedGuest[field?.name] || '';
    return values;
  }, {});
  // const initialFieldValues: any = dynamicInitialValues(guestInformationSection, selectedGuest)
  const validationSchema = guestInformationSection.reduce((schema: any, field: any) => {
    if (field?.isActive && field?.required === 'true') {
      schema[field?.name] = yup.string().required(`${field?.label} is required`);
    }
    if (field?.name === email) {
      schema[field?.name] = yup
        .string()
        .email('Invalid email format')
        .required('Email is required');
    }
    if (field?.name === phone) {
      schema[field?.name] = yup
        .string()
        .matches(phoneRegex, 'Invalid phone number')
        .required('Phone is required');
    }

    return schema;
  }, {});
  const combinedValidationSchema = yup.object(validationSchema);

  const formik = useFormik({
    initialValues: initialFieldValues,
    validationSchema: combinedValidationSchema,
    onSubmit: handleInputChange,
  });
  // const firstNameField = guestInformationSection.some((field: any) => field?.name === 'firstName' && field?.isActive == 'true') && guestInformationSection.some((field: any) => field?.name === 'lastName' && field?.isActive == 'true');

  return (
    <div className={styles.identityInputs}>
      {guestInformationSection.map(
        (field: any) =>
          field?.isActive && (
            <div key={field?.name} className={styles.col_100}>
              <StyledInput
                required={field?.required === 'true'}
                autoComplete='off'
                className={styles.guestDataInput}
                label={t(field?.label)}
                variant='standard'
                name={field?.name}
                id={field?.name}
                value={formik.values[field?.name]}
                disabled={field?.isDisabled === 'true'}
                onChange={(e) => {
                  formik.handleChange(e);
                  updateGuestDetails(e.target.id, e.target.value);
                }}
                onFocus={() => formik.setFieldTouched(field?.name, true)}
                error={Boolean(formik.touched[field?.name]) && Boolean(formik.errors[field?.name])}
                helperText={
                  formik.touched[field?.name] && formik.errors[field?.name]
                    ? `${formik.errors[field?.name]}`
                    : ''
                }
              />
            </div>
          ),
      )}
    </div>
  );
};
