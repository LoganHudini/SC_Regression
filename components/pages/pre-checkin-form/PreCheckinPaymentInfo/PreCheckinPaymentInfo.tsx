import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { IPreCheckinPaymentInfoProps } from './PreCheckinPaymentInfo.types';
import styles from './PreCheckinPaymentInfo.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { IPaymentInfo } from 'types/guest-information.types';
import { identityVerificationValidation } from 'validation/guest-information-input.validation';
import { ChangeEvent, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { cybersource, email, phone, phoneRegex } from 'utils/constants';
import * as yup from 'yup';


export const PreCheckinPaymentInfo: React.FC<IPreCheckinPaymentInfoProps> = ({ paymentInfo, creditCardInfoSection, paymentType }) => {
  const { t } = useTranslation('check-in');
  const [cardOpened, setCardOpened] = useState(true);
  const navigate = useLocalizedRouter();

  const handleInputChange = () => {
    setCardOpened(!cardOpened);
  };

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const updateGuestDetails = (name: string, value: string) => {
    const inputField = name;
    const inputValue = value;
    reservationGuestInfoStorageData({ ...guestReservationInfo, [inputField]: inputValue });
  };

  const edit = () => {
    if (paymentType === cybersource) {
      navigate(availablePaths.CHECK_IN_PAYMENT);
    }
  };

  const initialFieldValues = creditCardInfoSection.reduce((values: any, field: any) => {
    values[field?.name] = paymentInfo[field?.name] || '';
    return values;
  }, {});

  const validationSchema = creditCardInfoSection.reduce((schema: any, field: any) => {
    if (field?.isActive && field?.required === 'true') {
      schema[field?.name] = yup.string().required(`${field?.label} is required`);
    }
    if (field?.name === email) {
      schema[field?.name] = yup.string().email('Invalid email format').required('Email is required');
    }
    if (field?.name === phone) {
      schema[field?.name] = yup.string().matches(phoneRegex, 'Invalid phone number').required('Phone is required');
    }

    return schema;
  }, {});
  const combinedValidationSchema = yup.object(validationSchema);
  const formik = useFormik({
    initialValues: initialFieldValues,
    validationSchema: combinedValidationSchema,
    onSubmit: handleInputChange,
  });


  return (
    <div className={styles.identityInputs}>
      {creditCardInfoSection.map((field: any) => (
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
              helperText={formik.touched[field?.name] && formik.errors[field?.name] ? `${formik.errors[field?.name]}` : ''}
            />

          </div>
        )
      ))}
      {/* for styling its commented */}
      {/* <div>
        <div className={styles.col_100}>
          <StyledInput
            className={styles.guestDataInput}
            label={t('Card Number')}
            variant='standard'
            name={'cardNumber'}
            id={'cardNumber'}
            value={formik.values?.cardNumber}
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
            className={styles.guestDataInput}
            label={t('Name on the Card')}
            variant='standard'
            name={'cardHolderName'}
            id={'cardHolderName'}
            value={formik.values?.cardHolderName}
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
            className={styles.guestDataInput}
            label={t('Card Type')}
            variant='standard'
            name={'cardType'}
            id={'cardType'}
            disabled={true}
            value={formik.values?.cardType}
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
            className={styles.guestDataInput}
            label={t('Expiry')}
            variant='standard'
            name={'expiryDate'}
            id={'cardExpiryDate'}
            disabled={true}
            value={formik.values?.cardExpiryDate}
            onChange={(e) => {
              formik.handleChange(e);
              updateGuestDetails(e.target.id, e.target.value);
            }}
          />
        </div>
      </div> */}
      <div className={styles.editBtn}>
        <button className='' onClick={edit}>
          <span className={styles.btnText}>Edit</span>
        </button>
      </div>
    </div>
  );
};
