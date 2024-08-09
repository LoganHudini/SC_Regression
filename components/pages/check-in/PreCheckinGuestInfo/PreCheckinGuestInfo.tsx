import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { IPreCheckinGuestInfoProps } from './PreCheckinGuestInfo.types';
import styles from './PreCheckinGuestInfo.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useState } from 'react';
import {
  AUTOCOMPLETE,
  DATEPICKER,
  INVALID_DATE,
  NEWGUEST,
  NEWGUESTFORM,
  PRIMARY,
  SECONDARY,
  SELECTDROPDOWN,
  TIMEPICKER,
} from 'utils/constants';
import { generateInitialFieldValues } from 'utils/functions';
import { InputLabel, Select, MenuItem, FormHelperText, Autocomplete } from '@mui/material';
import { StyledFormControl } from 'components/shared/StyledFormControl/StyledFormControl';
import DropDown from '@icons/dropDownIcon.svg';
import { DatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useReactiveVar } from '@apollo/client';
import { accompanyGuestDetails } from 'storage/accompany-guest-details';
import useValidate from 'utils/hooks/useValidate';
import { hotelInformation } from 'storage/home.storage';

export const PreCheckinGuestInfo: React.FC<IPreCheckinGuestInfoProps> = ({
  selectedGuest,
  guestInformationSection,
  updateSelectedGuestInformation,
  type,
}) => {
  const { t } = useTranslation('check-in');
  const [cardOpened, setCardOpened] = useState(true);
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);
  const hotelInfo = useReactiveVar(hotelInformation);

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

    type === PRIMARY
      ? updateSelectedGuestInformation({ ...selectedGuest, [inputField]: inputValue })
      : type === SECONDARY
      ? updateSelectedGuestInformation([...accompanyGuestData])
      : updateSelectedGuestInformation({
          ...selectedGuest,
          [inputField]: inputValue,
        });
  };

  const initialFieldValues = generateInitialFieldValues(guestInformationSection, selectedGuest);

  const validationSchema = useValidate(guestInformationSection);

  const formik = useFormik({
    initialValues: initialFieldValues,
    validationSchema: validationSchema,
    onSubmit: handleInputChange,
    validateOnMount: true,
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
                    error={
                      (formik?.validateOnMount || formik.touched[field?.name]) &&
                      Boolean(formik.errors[field?.name])
                    }
                    required={field?.required}
                    className={styles.guestDataInput}
                    variant='standard'
                    sx={{ m: 1, minWidth: '100%' }}
                  >
                    <InputLabel>{t(field?.label)}</InputLabel>
                    <Select
                      disabled={
                        type === NEWGUESTFORM ? false : type === NEWGUEST ? true : field?.isDisabled
                      }
                      className={styles.guestDataInput}
                      label={t(field?.label)}
                      variant='standard'
                      name={field?.name}
                      id={field?.name}
                      value={formik?.values[field?.name] || ''}
                      onChange={(e) => {
                        formik.handleChange(e);
                        updateGuestDetails(e.target.name, e.target.value);
                      }}
                      IconComponent={DropDown}
                      error={
                        (formik?.validateOnMount || formik.touched[field?.name]) &&
                        Boolean(formik.errors[field?.name])
                      }
                    >
                      {field?.options?.map((item: any) => {
                        return (
                          <MenuItem value={item?.value} key={item?.value}>
                            <em>{t(item?.name)}</em>
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText>
                      {(formik?.validateOnMount || formik.touched[field?.name]) &&
                        formik.errors[field?.name] &&
                        t(String(formik.errors[field?.name]))}
                    </FormHelperText>
                  </StyledFormControl>
                </div>
              ) : field?.type === AUTOCOMPLETE ? (
                <Autocomplete
                  disablePortal
                  disableClearable={true}
                  disableListWrap
                  className={styles.guestDataInput}
                  options={field?.options?.map((item: any) => item?.name)}
                  value={
                    field?.options?.find((item: any) => item?.value === formik?.values[field?.name])
                      ?.name || ''
                  }
                  autoComplete={true}
                  onChange={(e, selectedData) => {
                    const updatedData = field?.options?.find(
                      (data: any) => data?.name === selectedData,
                    )?.value;
                    formik.setFieldValue(field?.name, updatedData);
                    updateGuestDetails(field?.name, updatedData);
                  }}
                  renderInput={(params) => (
                    <StyledInput
                      required
                      variant='standard'
                      {...params}
                      label={t(field?.label)}
                      InputProps={{
                        ...params.InputProps,
                      }}
                    />
                  )}
                />
              ) : field?.type === DATEPICKER ? (
                <div className={styles.col_100}>
                  <DatePicker
                    className={styles.guestDataInput}
                    inputFormat={timeFormats.DAY_MONTH_YEAR_2}
                    label={t(field?.label)}
                    value={formik.values[field?.name] || null}
                    onChange={(date) => {
                      const selectedDate: any = dayjs(date).format(timeFormats.YEAR_MONTH_DAY);
                      if (selectedDate !== INVALID_DATE) {
                        formik.setFieldValue(field?.name, selectedDate);
                        updateGuestDetails(field?.name, selectedDate);
                      } else {
                        formik.setFieldValue(field?.name, '');
                        updateGuestDetails(field?.name, '');
                      }
                    }}
                    disabled={
                      type === NEWGUESTFORM ? false : type === NEWGUEST ? true : field?.isDisabled
                    }
                    disableFuture={field?.isDisableFuture}
                    disablePast={field?.isDisablePast}
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
                        error={
                          (formik?.validateOnMount || formik.touched[field?.name]) &&
                          Boolean(formik.errors[field?.name])
                        }
                        helperText={
                          (formik?.validateOnMount || formik.touched[field?.name]) &&
                          formik.errors[field?.name] &&
                          t(String(formik.errors[field?.name]))
                        }
                      />
                    )}
                  />
                </div>
              ) : field?.type === TIMEPICKER ? (
                <div key={field?.name} className={styles.col_100}>
                  <MobileTimePicker
                    className={styles.guestDataInput}
                    label={t(field?.label)}
                    ampm={false}
                    disabled={
                      type === NEWGUESTFORM ? false : type === NEWGUEST ? true : field?.isDisabled
                    }
                    value={
                      formik?.values[field?.name] === INVALID_DATE ||
                      formik?.values[field?.name] === ''
                        ? null
                        : typeof formik?.values[field?.name] === 'string'
                        ? dayjs()
                            ?.hour(Number(formik?.values[field?.name]?.split(':')[0]))
                            ?.minute(Number(formik?.values[field?.name]?.split(':')[1]))
                        : dayjs(formik.values[field?.name]) || null
                    }
                    onChange={(newValue) => {
                      const selectedDate: any = dayjs(newValue).format(timeFormats.HOURS_MINUTES_2);
                      if (selectedDate !== INVALID_DATE) {
                        formik.setFieldValue(field?.name, dayjs(newValue));
                        updateGuestDetails(field?.name, selectedDate);
                      } else {
                        formik.setFieldValue(field?.name, '');
                        updateGuestDetails(field?.name, '');
                      }
                    }}
                    minTime={dayjs()
                      .set('hour', Number(hotelInfo?.checkInTime?.split(':')[0]))
                      .set('minute', hotelInfo?.checkInTime?.split(':')[1])}
                    renderInput={(params) => (
                      <StyledInput
                        name={field?.name}
                        id={field?.name}
                        required={field?.required}
                        variant='standard'
                        label={t(field?.label)}
                        {...params}
                        onFocus={() => formik.setFieldTouched(field?.name, true)}
                        error={
                          (formik?.validateOnMount || formik.touched[field?.name]) &&
                          Boolean(formik.errors[field?.name])
                        }
                        helperText={
                          (formik?.validateOnMount || formik.touched[field?.name]) &&
                          formik.errors[field?.name] &&
                          t(String(formik.errors[field?.name]))
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
                    inputProps={{ maxLength: field?.maxLength }}
                    type={field?.type}
                    name={field?.name}
                    id={field?.name}
                    value={formik.values[field?.name]}
                    disabled={
                      type === NEWGUESTFORM ? false : type === NEWGUEST ? true : field?.isDisabled
                    }
                    onChange={(e) => {
                      formik.handleChange(e);
                      updateGuestDetails(e.target.id, e.target.value);
                    }}
                    onFocus={() => formik.setFieldTouched(field?.name, true)}
                    error={
                      (formik?.validateOnMount || Boolean(formik.touched[field?.name])) &&
                      Boolean(formik.errors[field?.name])
                    }
                    helperText={
                      (formik?.validateOnMount || formik.touched[field?.name]) &&
                      formik.errors[field?.name] &&
                      t(String(formik.errors[field?.name]))
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
