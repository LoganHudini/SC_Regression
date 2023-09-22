import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { IPreCheckinGuestInfoProps } from './PreCheckinGuestInfo.types';
import styles from './PreCheckinGuestInfo.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { SELECTDROPDOWN } from 'utils/constants';
import { generateInitialFieldValues, generateValidationSchema } from 'utils/functions';
import { InputLabel, Select, MenuItem } from '@mui/material';
import { StyledFormControl } from 'components/shared/StyledFormControl/StyledFormControl';
import DropDown from '@icons/dropDownIcon.svg';

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
  const initialFieldValues = generateInitialFieldValues(guestInformationSection, selectedGuest);

  // const initialFieldValues: any = dynamicInitialValues(guestInformationSection, selectedGuest)

  const validationSchema = generateValidationSchema(guestInformationSection);

  const formik = useFormik({
    initialValues: initialFieldValues,
    validationSchema: validationSchema,
    onSubmit: handleInputChange,
  });

  // const firstNameField = guestInformationSection.some((field: any) => field?.name === 'firstName' && field?.isActive) && guestInformationSection.some((field: any) => field?.name === 'lastName' && field?.isActive);

  return (
    <div className={styles.identityInputs}>
      {guestInformationSection.map(
        (field: any) =>
          field?.isActive && (
            <div key={field?.name}>
              {field?.type == SELECTDROPDOWN ? (
                <StyledFormControl
                  required={field?.required}
                  disabled={field?.isDisabled}
                  className={styles.guestDataInput}
                  variant='standard'
                  sx={{ m: 1, minWidth: '100%' }}
                >
                  <InputLabel>{field?.label}</InputLabel>
                  <Select
                    className={styles.guestDataInput}
                    label={field?.label}
                    variant='standard'
                    name={field?.name}
                    id={field?.name}
                    value={formik.values[field?.name] || ''}
                    onChange={(e: any) => {
                      formik.handleChange(e);
                      updateGuestDetails(e.target.name, e.target.value);
                    }}
                    disabled={field?.isDisabled}
                    IconComponent={DropDown}
                  >
                    {field?.options.map((item: any) => {
                      return (
                        <MenuItem value={item?.value} key={item?.value}>
                          <em>{item?.name}</em>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </StyledFormControl>
              ) : (
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
                    error={
                      Boolean(formik.touched[field?.name]) && Boolean(formik.errors[field?.name])
                    }
                    helperText={
                      formik.touched[field?.name] && formik.errors[field?.name]
                        ? `${formik.errors[field?.name]}`
                        : ''
                    }
                  />
                </div>
              )}
            </div>
          ),
      )}
    </div>
  );
};
