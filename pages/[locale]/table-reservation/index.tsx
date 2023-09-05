import React, { useState, useCallback, useEffect } from 'react';
import styles from '../../../components/pages/table-reservations/CustomDrawer/CustomDrawer.module.scss';
import dayjs from 'dayjs';
import { TextField } from '@mui/material';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { RESTAURANTS_BARS } from 'utils/constants';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { ApolloError } from '@apollo/client';
import { client } from 'core/graphql/client';
import { HOTEL_ID } from 'core/graphql/endpoints';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
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
import { GetStaticProps } from 'next';
import { getStaticPaths } from 'utils/getStatic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from 'next-i18next.config';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import { ThankYouDrawer } from 'components/shared/ThankYouDrawer/ThankYouDrawer';

export { getStaticPaths };

const TableReservation = () => {
  const navigate = useLocalizedRouter();
  const { t } = useTranslation(['housekeeping', 'common', 'check-in']);
  const [loading, setLoading] = useState(false);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [thankYou, setThankYou] = useState(false);
  const [data, setData] = useState<any>('');
  const [disable, setDisable] = useState(false);
  const [specialReq, setspecialReq] = useState('');
  const [selectedDate, setSelectedDate] = useState<any>(dayjs().format('YYYY-MM-DD'));
  const [selectedTime, setSelectedTime] = useState(dayjs().format('HH:mm'));
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const restaurantId =
    (typeof window !== 'undefined' &&
      localStorage.getItem('restaurantId') &&
      JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
    '';
  const minutesArray = new Array(4)
    .fill(0)
    .map((_el, index) => String(index * 15).padStart(2, '0'));
  const listOfTables = data?.data?.getRestaurantReservationDetails?.tables;
  // const capacity = listOfTables?.filter((count: { capacity: number }) => {
  //   return count?.capacity >= guestCount;
  // });

  const toggleConditionsAccepted = useCallback(() => {
    setConditionsAccepted((oldState) => !oldState);
  }, []);

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

  // const tableExposure = capacity?.filter(
  //   (elm: { tableNumber: string; exposure: string }) => elm.tableNumber === formik.values.tableNo,
  // );

  useEffect(() => {
    if (listOfTables?.length === 0 || !restaurantId) {
      toast(t('Tables Unavailable'), { type: 'error' });
      navigate(availablePaths?.RESTAURANTS_BARS);
    }
  }, [listOfTables?.length, navigate, restaurantId, t]);

  useEffect(() => {
    try {
      client
        .query({
          query: GET_RESTAURANT_RESERVATION_DETAILS,
          context: { clientName: 'host_v3' },
          variables: { restaurantId: restaurantId, lang: '' },
        })
        .then((value) => {
          setData(value);
        });
    } catch (err) {
      console.log(err);
    }
  }, [restaurantId]);

  const gotoThankyoupage = useCallback(async () => {
    setLoading(true);
    const DetailsReservationPayload = {
      date: dayjs(selectedDate).format('YYYY-MM-DD'),
      exposure: 'No preference',
      hotelId: HOTEL_ID,
      isReservedForGuest: false,
      restaurantId: restaurantId ?? '',
      reserveFrom: selectedTime ?? '',
      reserveUntil: dayjs(selectedTime, 'HH:mm').add(1, 'hour').format('HH:mm'),
      description: specialReq,
      firstName: `${formik.values.name}` ?? '',
      guestType: conditionsAccepted ? 'resident' : 'nonresident',
      lastName: '',
      noOfGuests: guestCount,
      roomNo: formik.values.roomNumber,
      tableNumbers: [],
    };

    try {
      await client.mutate({
        mutation: CREATE_RESTAURANT_RESERVATION,
        context: { clientName: 'host_v3' },
        fetchPolicy: 'network-only',
        variables: DetailsReservationPayload,
      });
      setThankYou(true);
      setGuestCount(1);
      formik.resetForm();
      setSelectedDate(dayjs());
      setSelectedTime(dayjs().format('HH:mm'));
    } catch (err) {
      processError(t, err as ApolloError);
    }
    setLoading(false);
  }, [
    selectedDate,
    restaurantId,
    selectedTime,
    specialReq,
    formik,
    conditionsAccepted,
    guestCount,
    t,
  ]);

  const decrement = () => {
    setGuestCount((state) => state - 1);
  };

  const increment = () => {
    setGuestCount((state) => state + 1);
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
    <>
      <div>
        <Head>
          <title>Details of Reservation</title>
        </Head>
        <Header displayBackButton screenTitle='Details of Reservation' />

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

            {/* <DateTimeSelect
              setSelectedDate={setSelectedDate}
              selectedDate={selectedDate}
              setSelectedTime={setSelectedTime}
              selectedTime={selectedTime}
              minutesArray={minutesArray}
              disable={disable}
              setDisable={setDisable}
            /> */}

            {/* <>
              {capacity?.length !== 0 && (
                <>
                  <InputLabel className={styles.choosetable} id={'tableNo'}>
                    {t('Preferred Table')}
                  </InputLabel>
                  <div className={styles.dropdown}>
                    <Select
                      variant='outlined'
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
                          Table {count?.tableNumber}: {count?.exposure}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </>
              )}
            </>

            {capacity?.length === 0 && (
              <div className={styles.error}>{t('No. of people exceeds Table Capacity')}</div>
            )} */}

            <p className={styles.chooseRequestTitle}>{t('Special Requests')}</p>
            <div className={styles.sptext}>
              <TextField
                fullWidth
                placeholder='Type here'
                multiline
                maxRows={4}
                onChange={(e) => {
                  setspecialReq(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles.buttonWrapper}>
          <StyledButton
            variant='contained'
            loading={loading}
            className={styles.orderButton}
            disabled={disable}
            onClick={formik.submitForm}
          >
            {t('BOOK A TABLE')}
          </StyledButton>
        </div>

        {/* </div> */}
      </div>
      <ThankYouDrawer
        opened={thankYou}
        close={setThankYou}
        title={t('Your booking has been confirmed.') as string}
        redirect={RESTAURANTS_BARS}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'], i18nConfig)),
    },
  };
};

export default TableReservation;
