import React, { useState, useCallback, useEffect } from 'react';
import { ICustomDrawerProps } from './CustomDrawer.types';
import cx from 'classnames';
import styles from './CustomDrawer.module.scss';
import dayjs from 'dayjs';
import { InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { Schedules } from 'utils/constants';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import CheckMark from '@icons/thinCheckMark.svg';
import { TimeSelectElement } from 'components/shared/TimeSelectElement/TimeSelectElement';
import { timeFormats } from 'utils/timeFormats';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import { CalendarPicker } from '@mui/x-date-pickers';
import { TimeSelect } from 'components/shared/TimeSelectModal/TimeSelectModal';
import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import { restaurantListStorage, tableReservationStorage } from 'storage/table-reservation.storage';
import { client } from 'core/graphql/client';
import { RESERVE_TABLE } from 'core/graphql/queries/SEVENROOMS_RESERVE_TABLE';
import { HOTEL_ID } from 'core/graphql/endpoints';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { CREATE_TABLE_RESERVATION } from 'core/graphql/queries/CREATE_TABLE_RESERVATION';
import {
  CREATE_RESTAURANT_RESERVATION,
  GET_RESTAURANT_RESERVATION_DETAILS,
} from 'core/graphql/queries/GET_RESTAURANT_RESERVATION_DETAILS';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { StyledCheckBox } from 'components/shared/StyledCheckBox/StyledCheckBox';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import {
  TableReservationValidation,
  TableReservationValidationWithoutRoomNumber,
} from 'validation/tableReservation.validation';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { processError } from 'utils/processError';
import { toast } from 'react-toastify';

export const CustomDrawer: React.FC<ICustomDrawerProps> = ({ opened, toggleOpened }) => {
  const [guestCount, setGuestCount] = useState<number>(1);
  const [selectedSchedule, setSelectedSchedule] = useState<string>(Schedules[0]);
  const [confirm, setConfirm] = useState(true);
  const [thankYou, setThankYou] = useState(false);
  const [data, setData] = useState<any>('');
  const [disable, setDisable] = useState(false);
  const [specialReq, setspecialReq] = useState('');
  const [selectedDate, setSelectedDate] = useState<any>(dayjs().format('YYYY-MM-DD'));
  const [selectedTime, setSelectedTime] = useState(dayjs().format('HH:mm'));
  const [tableno, setTableno] = useState('');
  const tableReservationInfo = useReactiveVar(tableReservationStorage);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const { t } = useTranslation(['housekeeping', 'common', 'check-in']);
  const minutesArray = new Array(4)
    .fill(0)
    .map((_el, index) => String(index * 15).padStart(2, '0'));

  const toggleConditionsAccepted = useCallback(() => {
    setConditionsAccepted((oldState) => !oldState);
  }, []);

  useEffect(() => {
    if (tableReservationInfo !== null) {
      try {
        client
          .query({
            query: GET_RESTAURANT_RESERVATION_DETAILS,
            context: { clientName: 'host_v3' },
            variables: { restaurantId: tableReservationInfo?.id, lang: '' },
          })
          .then((value) => {
            setData(value);
          });
      } catch (err) {
        console.log(err);
      }
    }
  }, [tableReservationInfo]);

  const submit = () => {
    gotoThankyoupage();
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      roomNumber: '',
      tableNo: '',
      phoneNumber: '',
    },
    validationSchema: conditionsAccepted
      ? TableReservationValidation
      : TableReservationValidationWithoutRoomNumber,
    onSubmit: submit,
  });

  const capacity = data?.data?.getRestaurantReservationDetails?.tables?.filter(
    (count: { capacity: number }) => {
      return count?.capacity >= guestCount;
    },
  );

  const gotoThankyoupage = useCallback(async () => {
    const tableExposure = capacity?.filter(
      (elm: { tableNumber: string; exposure: string }) => elm.tableNumber === formik.values.tableNo,
    );

    const DetailsReservationPayload = {
      date: dayjs(selectedDate).format('YYYY-MM-DD'),
      exposure: tableExposure[0]?.exposure,
      hotelId: HOTEL_ID,
      isReservedForGuest: conditionsAccepted,
      restaurantId: tableReservationInfo?.id ?? '',
      reserveFrom: selectedTime ?? '',
      reserveUntil: dayjs(selectedTime, 'HH:mm').add(1, 'hour').format('HH:mm'),
      description: '',
      firstName: `${formik.values.name}` ?? '',
      guestType: '',
      lastName: '',
      noOfGuests: guestCount,
      roomNo: formik.values.roomNumber,
      tableNumbers: formik.values.tableNo,
    };

    try {
      const response = await client.mutate({
        mutation: CREATE_RESTAURANT_RESERVATION,
        context: { clientName: 'host_v3' },
        fetchPolicy: 'network-only',
        variables: DetailsReservationPayload,
      });
      toast(t('Table reserved successfully'), { type: 'success' });
      setConfirm(false);
      setGuestCount(1);
      formik.resetForm();
      setSelectedDate(dayjs());
      setSelectedTime(dayjs().format('HH:mm'));
      setThankYou(true);
      toggleOpened();
    } catch (err) {
      processError(t, err as ApolloError);
    }
  }, [
    capacity,
    selectedDate,
    conditionsAccepted,
    tableReservationInfo?.id,
    selectedTime,
    formik,
    guestCount,
    t,
    toggleOpened,
  ]);

  const decrement = () => {
    setGuestCount((state) => state - 1);
  };

  const increment = () => {
    setGuestCount((state) => state + 1);
  };

  const handleContinue = () => {
    setConfirm(true);
    setThankYou(false);
  };

  useEffect(() => {
    if (!opened) {
      setConfirm(true);
      setThankYou(false);
    }
  }, [opened, thankYou, confirm]);

  const handleChange = (event: SelectChangeEvent) => {
    setTableno(event.target.value as string);
  };

  useEffect(() => {
    if (
      dayjs().format('HH:mm') >= selectedTime &&
      dayjs(selectedDate).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    ) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [formik.values.tableNo, selectedDate, selectedTime]);

  return (
    <div>
      <div
        onClick={toggleOpened}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      ></div>
      <div
        className={cx(
          styles.wrapper,
          { [styles.wrapperOpened]: opened },
          { [styles.thankYouWrapper]: thankYou },
        )}
      >
        {confirm && (
          <div className={styles.confirmationWrapper}>
            <div className={styles.title}>Reservation Details</div>
            <div className={styles.scrollitem}>
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
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched?.name && formik.errors.name}
              />
              <div className={styles.checkBoxWrapper}>
                <StyledCheckBox onClick={toggleConditionsAccepted} value={conditionsAccepted} />
                <p className={styles.guest}>{t('Are you a hotel guest?')}</p>
              </div>
              {conditionsAccepted && (
                <StyledInput
                  required
                  autoComplete='off'
                  className={styles.guestDataInput}
                  label={t('Room Number')}
                  variant='standard'
                  name={'roomNumber'}
                  id={'roomNumber'}
                  value={formik.values?.roomNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.roomNumber && Boolean(formik.errors.roomNumber)}
                  helperText={formik.touched?.roomNumber && formik.errors.roomNumber}
                />
              )}
              <StyledInput
                autoComplete='off'
                className={styles.guestDataInput}
                label={t('Phone Number')}
                variant='standard'
                name={'phoneNumber'}
                id={'phoneNumber'}
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onFocus={() => formik.setFieldTouched('phoneNumber', true)}
                error={Boolean(formik.touched.phoneNumber) && Boolean(formik.errors.phoneNumber)}
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              />

              <div className={styles.itemRow}>
                <p className={styles.itemTitle}>{t('No. of people')}</p>
                <div className={styles.plusMinusInputWrapper}>
                  <PlusMinusInput
                    value={guestCount}
                    onClickMinus={decrement}
                    onClickPlus={increment}
                    minQuantity={1}
                    className={styles.counterGuest}
                  />
                </div>
              </div>

              <>
                {capacity?.length !== 0 && (
                  <>
                    <InputLabel className={styles.choosetable} id={'tableNo'}>
                      {t('Preferred Table')}
                    </InputLabel>
                    <div className={styles.dropdown}>
                      <Select
                        variant='standard'
                        className={styles.select}
                        value={formik.values.tableNo}
                        onChange={formik.handleChange}
                        name={'tableNo'}
                        id={'tableNo'}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        fullWidth
                        required
                        error={formik.touched.tableNo && Boolean(formik.errors.tableNo)}
                      >
                        {capacity?.map((count: any) => (
                          <MenuItem key={count?.tableNumber} value={count?.tableNumber}>
                            {count?.tableNumber}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  </>
                )}
              </>

              {capacity?.length === 0 && (
                <div className={styles.error}>{t('No. of people exceeds Table Capacity')}</div>
              )}

              {/* <DateTimeSelect
                setSelectedDate={setSelectedDate}
                selectedDate={selectedDate}
                setSelectedSchedule={setSelectedSchedule}
                setSelectedTime={setSelectedTime}
                selectedTime={selectedTime}
                minutesArray={minutesArray}
                disable={disable}
                setDisable={setDisable}
              /> */}

              <p className={styles.chooseRequestTitle}>{t('Special Requests')}</p>
              <div className={styles.sptext}>
                <TextField
                  fullWidth
                  placeholder={`${t('Type here')}`}
                  multiline
                  maxRows={4}
                  onChange={(e) => {
                    setspecialReq(e.target.value);
                  }}
                />
              </div>
            </div>

            <StyledButton
              variant='contained'
              className={styles.orderButton}
              disabled={disable}
              onClick={formik.submitForm}
            >
              {t('BOOK A TABLE')}
            </StyledButton>
          </div>
        )}

        {thankYou && (
          <div className={styles.thankyouWrapper}>
            <CheckMark className={styles.checkIcon} />
            <div className={styles.thankyouRow}>
              <div className={styles.title}> {t('Thank you')} </div>
              <p className={styles.confirmmessage}> {t(' Your booking has been confirmed.')} </p>
            </div>
            <StyledButton
              variant='contained'
              className={styles.continuebutton}
              onClick={() => {
                handleContinue(), toggleOpened();
              }}
            >
              {t('Continue Booking')}
            </StyledButton>
          </div>
        )}
      </div>
    </div>
  );
};
