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

export const PreCheckinPaymentInfo: React.FC<IPreCheckinPaymentInfoProps> = ({ paymentInfo }) => {
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
    navigate(availablePaths.CHECK_IN_PAYMENT);
  };

  const formik = useFormik({
    initialValues: paymentInfo as IPaymentInfo,
    validationSchema: identityVerificationValidation,
    onSubmit: handleInputChange,
  });
  return (
    <div className={styles.identityInputs}>
      <div>
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
      </div>
      <div className={styles.editBtn}>
        <button className='' onClick={edit}>
          <span className={styles.btnText}>Edit</span>
        </button>
      </div>
    </div>
  );
};
