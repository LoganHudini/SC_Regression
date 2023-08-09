import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { IPreCheckinDocInfoProps } from './PreCheckinDocInfo.types';
import styles from './PreCheckinDocInfo.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { IDocInfo } from 'types/guest-information.types';
import { identityVerificationValidation } from 'validation/guest-information-input.validation';
import { useState, useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { StyledFormControl } from 'components/shared/StyledFormControl/StyledFormControl';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import IdScanImage from '@icons/idScanImage.svg';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import DateRangeIcon from '@icons/DateRangeIcon.svg';

export const PreCheckinDocInfo: React.FC<IPreCheckinDocInfoProps> = ({ docInfo }) => {
  const { t } = useTranslation('check-in');
  const navigate = useLocalizedRouter();
  const [cardOpened, setCardOpened] = useState(true);
  const handleInputChange = () => {
    setCardOpened(!cardOpened);
  };

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const updateGuestDetails = (name: string, value: string) => {
    const inputField = name;
    const inputValue = value;
    // reservationGuestInfoStorageData({ ...guestReservationInfo, [inputField]: inputValue });
  };
  const updateDocType = (value: string) => {
    sessionStorage.setItem('docType', value);
  };

  const formik = useFormik({
    initialValues: docInfo as IDocInfo,
    validationSchema: identityVerificationValidation,
    onSubmit: handleInputChange,
  });

  // const scan = () => {
  //   navigate(availablePaths.INCODE);
  // };

  useEffect(() => {
    reservationGuestInfoStorageData({
      ...guestReservationInfo,
      docNo: formik.values?.docNo ?? '',
      docType: formik.values?.docType ?? '',
      effectiveDate: formik.values?.effectiveDate ?? '',
      expiryDate: formik.values?.expiryDate ?? '',
      issueCountry: formik.values?.issueCountry ?? '',
    });
  }, [formik.values]);

  const setEmpty = () => {
    formik.values.docNo = '';
  };
  // useEffect(() => {
  //   if (formik.values?.docType !== guestReservationInfo.docType.value) {
  //     formik.values.docNo = '';
  //   }
  // }, [guestReservationInfo.docType, guestReservationInfo.docNo, formik.values]);

  return (
    <div className={styles.identityInputs}>
      <div className={styles.col_100}>
        <div className={styles.col_100}>
          <StyledFormControl
            required
            className={styles.guestDataInput}
            variant='standard'
            sx={{ m: 1, minWidth: '100%' }}
          >
            <InputLabel>Document Type</InputLabel>
            <Select
              className={styles.guestDataInput}
              label={t('Document Type')}
              variant='standard'
              name={'docType'}
              id={'docType'}
              value={formik.values?.docType}
              onChange={(e) => {
                formik.handleChange(e);
                updateDocType(e.target.value);
                updateGuestDetails(e.target.name, e.target.value);
                updateGuestDetails('docNo', '');
                formik.values.docNo = '';
                formik.values.effectiveDate = '';
                formik.values.expiryDate = '';
                formik.values.issueCountry = '';
              }}
            >
              <MenuItem value={'Passport'}>
                <em>Passport</em>
              </MenuItem>
              <MenuItem value={'Driving License'}>
                <em>Driving License</em>
              </MenuItem>
            </Select>
          </StyledFormControl>
        </div>
      </div>
      <div className={styles.col_100}>
        <div className={styles.col_100}>
          <StyledInput
            required
            autoComplete='off'
            className={styles.guestDataInput}
            label={t('Id Number')}
            variant='standard'
            name={'docNo'}
            id={'docNo'}
            value={formik.values?.docNo}
            onChange={(e) => {
              formik.handleChange(e);
              updateGuestDetails(e.target.id, e.target.value);
            }}
          />
        </div>
      </div>
      <div className={styles.col_100}>
        <div className={styles.col_100}>
          <DatePicker
            disableFuture={true}
            className={styles.styledDateInput}
            onChange={(value) => {
              const effectiveDate = dayjs(value).format(timeFormats.YEAR_MONTH_DAY);
              formik.setFieldValue('effectiveDate', effectiveDate, true);
            }}
            value={
              formik.values?.effectiveDate !== ''
                ? dayjs(formik.values?.effectiveDate, timeFormats.YEAR_MONTH_DAY)
                : null
            }
            inputFormat={timeFormats.YEAR_MONTH_DAY}
            components={{
              OpenPickerIcon: () => <DateRangeIcon className={styles.calendarIcon} />,
            }}
            label={t('Issue Date')}
            renderInput={(params) => (
              <StyledInput
                required
                autoComplete='off'
                className={styles.identityVerificationInput}
                variant='standard'
                name='EffectiveDate'
                id='EffectiveDate'
                {...params}
                error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
                helperText={formik.touched.effectiveDate && formik.errors.effectiveDate}
              />
            )}
          />
        </div>
      </div>
      <div className={styles.col_100}>
        <div className={styles.col_100}>
          <DatePicker
            disablePast={true}
            className={styles.styledDateInput}
            onChange={(value) => {
              const expiryDate = dayjs(value).format(timeFormats.YEAR_MONTH_DAY);
              formik.setFieldValue('expiryDate', expiryDate, true);
            }}
            value={
              formik.values?.expiryDate !== ''
                ? dayjs(formik.values?.expiryDate, timeFormats.YEAR_MONTH_DAY)
                : null
            }
            inputFormat={timeFormats.YEAR_MONTH_DAY}
            components={{
              OpenPickerIcon: () => <DateRangeIcon className={styles.calendarIcon} />,
            }}
            label={t('Expiry Date')}
            renderInput={(params) => (
              <StyledInput
                autoComplete='off'
                className={styles.identityVerificationInput}
                variant='standard'
                name='ExpiryDate'
                id='ExpiryDate'
                {...params}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                helperText={formik.touched.expiryDate && formik.errors.expiryDate}
              />
            )}
          />
        </div>
      </div>
      <div className={styles.col_100}>
        <div className={styles.col_100}>
          <StyledInput
            required
            autoComplete='off'
            className={styles.guestDataInput}
            label={t('Issue Country')}
            variant='standard'
            name={'issueCountry'}
            id={'issueCountry'}
            value={formik.values?.issueCountry}
            onChange={(e) => {
              formik.handleChange(e);
            }}
          />
        </div>
      </div>

      {/* <div className={styles.scanBtn}>
        <button onClick={scan}>
          <div className={styles.btnText}>Scan Travel Document</div>
          <div>
            <IdScanImage className={styles.alignment} />
          </div>
        </button>
      </div> */}
    </div>
  );
};
