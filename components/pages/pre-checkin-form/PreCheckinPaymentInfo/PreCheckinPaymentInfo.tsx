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
import { CYBERSOURCE, EMAIL, PHONE, PHONE_REGEX } from 'utils/constants';
import * as yup from 'yup';
import { generateInitialFieldValues, generateValidationSchema } from 'utils/functions';

export const PreCheckinPaymentInfo: React.FC<IPreCheckinPaymentInfoProps> = ({
  paymentInfo,
  creditCardInfoSection,
  paymentType,
}) => {
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
    if (paymentType === CYBERSOURCE) {
      navigate(availablePaths.CHECK_IN_PAYMENT);
    }
  };

  const initialFieldValues = generateInitialFieldValues(creditCardInfoSection, paymentInfo);

  const validationSchema = generateValidationSchema(creditCardInfoSection);

  const formik = useFormik({
    initialValues: initialFieldValues,
    validationSchema: validationSchema,
    onSubmit: handleInputChange,
  });

  return (
    <div className={styles.identityInputs}>
      {creditCardInfoSection?.map(
        (field: any) =>
          field?.isActive && (
            <div key={field?.name} className={styles.col_100}>
              <StyledInput
                required={field?.required}
                autoComplete='off'
                className={styles.guestDataInput}
                label={t(field?.label)}
                variant='standard'
                name={field?.name}
                id={field?.name}
                value={formik.values[field?.name]}
                disabled={field?.isDisabled}
                onChange={(e) => {
                  formik.handleChange(e);
                  updateGuestDetails(e.target.id, e.target.value);
                }}
                onFocus={() => formik.setFieldTouched(field?.name, true)}
                error={Boolean(formik.touched[field?.name]) && Boolean(formik.errors[field?.name])}
                helperText={
                  formik.touched[field?.name] &&
                  formik.errors[field?.name] &&
                  `${formik.errors[field?.name]}`
                }
              />
            </div>
          ),
      )}
      {/* <div className={styles.editBtn}>
        <button className='' onClick={edit}>
          <span className={styles.btnText}>Edit</span>
        </button>
      </div> */}
    </div>
  );
};
