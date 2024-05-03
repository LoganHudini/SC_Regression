import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { IPreCheckinGuestInfoProps } from './PreCheckinGuestInfo.types';
import styles from './PreCheckinGuestInfo.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useState } from 'react';
import { DATEPICKER, SELECTDROPDOWN } from 'utils/constants';
import { generateInitialFieldValues, generateValidationSchema } from 'utils/functions';
import { InputLabel, Select, MenuItem } from '@mui/material';
import { StyledFormControl } from 'components/shared/StyledFormControl/StyledFormControl';
import DropDown from '@icons/dropDownIcon.svg';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useReactiveVar } from '@apollo/client';
import { accompanyGuestDetails } from 'storage/accompany-guest-details';

export const PreCheckinGuestInfo: React.FC<IPreCheckinGuestInfoProps> = ({
  selectedGuest,
  guestInformationSection,
  updateSelectedGuestInformation,
  type,
}) => {
  const { t } = useTranslation('check-in');
  const [cardOpened, setCardOpened] = useState(true);
  const [onOpen, setOnOpen] = useState(false);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);

  const handleInputChange = () => {
    setCardOpened(!cardOpened);
  };

  const updateGuestDetails = (name: string, value: string) => {
    const inputField = name;
    const inputValue = value;

    accompanyGuestData?.findIndex((item: any) => item?.id === selectedGuest?.id) > -1 &&
      (accompanyGuestData[
        accompanyGuestData?.findIndex((item: any) => item?.id === selectedGuest?.id)
      ] = {
        ...selectedGuest,
        [inputField]: inputValue,
      });

    type === 'primary'
      ? updateSelectedGuestInformation({ ...selectedGuest, [inputField]: inputValue })
      : updateSelectedGuestInformation([...accompanyGuestData]);
  };

  const initialFieldValues = generateInitialFieldValues(guestInformationSection, selectedGuest);

  const validationSchema = generateValidationSchema(guestInformationSection);

  const formik = useFormik({
    initialValues: initialFieldValues,
    validationSchema: validationSchema,
    onSubmit: handleInputChange,
  });

  return (
    <div className={styles.identityInputs}>
      {guestInformationSection?.map(
        (field: any) =>
          field?.isActive && (
            <div key={field?.name}>
              {field?.type == SELECTDROPDOWN ? (
                <div className={styles.col_100}>
                  <StyledFormControl
                    required={field?.required}
                    disabled={field?.isDisabled}
                    className={styles.guestDataInput}
                    variant='standard'
                    sx={{ m: 1, minWidth: '100%' }}
                  >
                    <InputLabel>{t(field?.label)}</InputLabel>
                    <Select
                      className={styles.guestDataInput}
                      label={t(field?.label)}
                      variant='standard'
                      name={field?.name}
                      id={field?.name}
                      value={formik?.values[field?.name] || ''}
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
                            <em>{t(item?.name)}</em>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </StyledFormControl>
                </div>
              ) : field?.type === DATEPICKER ? (
                <div className={styles.col_100}>
                  <DatePicker
                    open={onOpen}
                    onOpen={() => setOnOpen(true)}
                    onClose={() => setOnOpen(false)}
                    className={styles.guestDataInput}
                    label={t(field?.label)}
                    value={formik.values[field?.name] || null}
                    onChange={(date) => {
                      const expiryDate = dayjs(date).format(timeFormats.YEAR_MONTH_DAY);
                      formik.setFieldValue(field?.name, expiryDate);
                      updateGuestDetails(field?.name, expiryDate);
                      setOnOpen(false);
                    }}
                    disabled={field?.isDisabled}
                    disableFuture={field?.isDisableFuture}
                    disablePast={field?.isDisablePast}
                    componentsProps={{
                      actionBar: { actions: [] },
                    }}
                    renderInput={(params) => (
                      <StyledInput
                        required={field?.required}
                        autoComplete='off'
                        className={styles.guestDataInput}
                        variant='standard'
                        name={field?.name}
                        id={field?.name}
                        onFocus={() => formik.setFieldTouched(field?.name, true)}
                        {...params}
                        error={formik.touched[field?.name] && Boolean(formik.errors[field?.name])}
                        helperText={
                          formik.touched[field?.name] &&
                          formik.errors[field?.name] &&
                          `${formik.errors[field?.name]}`
                        }
                      />
                    )}
                  />
                </div>
              ) : (
                <div key={field?.name} className={styles.col_100}>
                  <StyledInput
                    required={field?.required}
                    autoComplete='off'
                    className={styles.guestDataInput}
                    label={t(field?.label)}
                    variant='standard'
                    type={field?.type}
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
                      formik.touched[field?.name] &&
                      formik.errors[field?.name] &&
                      `${formik.errors[field?.name]}`
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
