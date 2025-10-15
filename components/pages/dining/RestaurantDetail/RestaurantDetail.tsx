/* eslint-disable camelcase */
import React, { useCallback, useEffect, useState } from 'react';
import styles from './RestaurantDetails.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { IDiningOrdersProps } from './RestaurantDetail.types';
import { useTranslation } from 'react-i18next';
import TimeIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import {
  getFirstSeatingDateTime,
  getFormattedTime,
  getTimings,
  isBookingAllowed,
  moduleType,
  restaurantCtaNavigation,
} from 'utils/functions';
import { ASSETS_URL, HOTEL_ID } from 'core/graphql/endpoints';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { availablePaths } from 'utils/availablePaths';
import {
  ACTIVE,
  ERRORMSG,
  FAILURE,
  SUCCESS,
  WEBURL,
  S3,
  RESTAURANTS_AND_BARS,
  DINING,
  ALL_DAY,
  CMS,
  VENDOR,
  EXTERNAL_URL,
} from 'utils/constants';
import cx from 'classnames';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useCheckedIn } from 'storage/check-in.storage';
import { CREATE_RESTAURANT_RESERVATION } from 'core/graphql/queries/GET_RESTAURANT_RESERVATION_DETAILS';
import { client } from 'core/graphql/client';
import {
  hotelInfoStorage,
  notificationStorage,
  toggleDetailsDrawer,
  toggleNotification,
  toggleRestaurantDetailsDrawer,
  hotelInformation,
} from 'storage/home.storage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { useMutation, useReactiveVar } from '@apollo/client';
import { PhoneEmail } from 'components/shared/PhoneEmail/PhoneEmail';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';
import { isEmpty } from 'lodash';
import useTimeStatus from 'utils/hooks/useTimeStatus';
import { useConfig } from 'utils/hooks/useConfiguration';
import { getPhoneEmailValidationForTableReservation } from 'validation/get-reservation.validation';
import { useFormik } from 'formik';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { GET_SLOT_DETAILS } from 'core/graphql/queries/GET_AVAILABLE_TABLE_RESERVATION_SLOTS';
import { CREATE_TABLE_RESERVATION_VENDOR } from 'core/graphql/queries/CREATE_TABLE_RESERVATION_VENDOR';
import MuiPhoneNumber from 'material-ui-phone-number';
import { Countries } from 'utils/countryList';
import DateTimeSelectRestaurant from 'components/shared/DateTimeSelect/DateTimeSelectRestaurant';

export const RestaurantDetail: React.FC<IDiningOrdersProps> = ({
  selectedRestaurant,
  timeSelectProps,
}) => {
  const { t } = useTranslation(['restaurants']);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const hotelInformationData = useReactiveVar(hotelInfoStorage);
  const [timeExtractedArray, settimeExtractedArray] = useState([]);
  const [selectedSpaSlots, setSelectedSpaSlots] = useState<any>({});
  const [tableBookingLoading, setTableBookingLoading] = useState<any>(false);

  const getRestaurantStatus = useTimeStatus({
    module: DINING,
    slide: selectedRestaurant,
    hotelInformation: hotelInformationData,
    t,
  });

  useEffect(() => {
    if (
      selectedRestaurant?.cta?.status == ACTIVE &&
      selectedRestaurant?.cta?.redirectOption == EXTERNAL_URL &&
      selectedRestaurant?.cta?.redirectUrl
    ) {
      return setBtnDisabled(true);
    }
    const isOpen = getFormattedTime(selectedRestaurant?.hours?.map((time: any) => time?.open));
    const isClose = getFormattedTime(selectedRestaurant?.hours?.map((time: any) => time?.close));
    const btnDisabled: any =
      isOpen?.includes(ALL_DAY) && isClose?.includes(ALL_DAY)
        ? 'open'
        : getRestaurantStatus?.status;
    const keywords = ['open', 'Closes in'];
    const isMatch = keywords.some((keyword) => {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      return pattern.test(btnDisabled);
    });
    setBtnDisabled(isMatch);
  }, [selectedRestaurant, timeSelectProps, btnDisabled, getRestaurantStatus?.status]);

  // const orderId = ordersData[ordersData?.length - 1]?.id?.slice(0, 6);
  const [availableSlots, setAvailableSlots] = useState(false);
  const [timeSelectDrawer, setTimeSelectDrawer] = useState(false);
  const [detailContent, setDetailContent] = useState(true);
  const [selectedTime, setSelectedTime] = useState('');
  const config = useConfig();
  const tableModule: any = moduleType(config?.modules, 'table_reservation');
  const [guestCount, setGuestCount] = useState(1);
  const hotelInfo: any = useReactiveVar(hotelInformation);
  const hotelId = useConfig()?.hotelId;
  const [iframeComponent, setIframeComponent] = useState(false);
  const [menu, setMenu] = useState(false);
  const [menuLink, setmenuLink] = useState(null);
  const currentYear = new Date().getFullYear();
  const isCheckedIn = useCheckedIn();
  const queryResultEntity = selectedRestaurant ?? '';
  const disableTimepiCketConfirmBtn =
    (!isEmpty(queryResultEntity) && isBookingAllowed(queryResultEntity?.hours, selectedTime)) || '';
  const restaurantId = queryResultEntity?.id;
  const drawerStatus = useReactiveVar(toggleDetailsDrawer);
  const restaurantDetailDrawer = useReactiveVar(toggleRestaurantDetailsDrawer);

  useEffect(() => {
    if (timeSelectProps) {
      setTimeSelectDrawer(true);
      setDetailContent(false);
    } else {
      setTimeSelectDrawer(false);
      setDetailContent(true);
    }
  }, [timeSelectProps, restaurantDetailDrawer]);

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    setAvailableSlots(false);
    setSelectedTime(dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM));
    setTimeSelectDrawer(false);
    setDetailContent(true);
    setGuestCount(1);
    settimeExtractedArray([]);
    formik.resetForm();
  };

  const parsed = dayjs(`${selectedTime} ${currentYear}`, 'DD MMM:hh:mm:A YYYY');
  const first_seating = getFirstSeatingDateTime(selectedTime);
  const last_seating: any = dayjs(first_seating)
    .hour(23)
    .minute(59)
    .second(0)
    .millisecond(0)
    .format('YYYY-MM-DDTHH:mm');

  const [getSlots, { loading: tableLoading }] = useMutation(GET_SLOT_DETAILS, {
    context: { clientName: 'integration_k' },
    variables: {
      hotelId: hotelId,
      startTime: first_seating || '',
      restaurant_id: queryResultEntity?.id,
      endTime: last_seating || '',
      only_available: true,
      noOfSeats: guestCount || 2,
    },
    fetchPolicy: 'no-cache',
  });

  const handleFindTable = useCallback(async () => {
    if (tableModule?.type === CMS) {
      const DetailsReservationPayload = {
        date: parsed.format('YYYY-MM-DD'),
        exposure: 'No preference',
        hotelId: HOTEL_ID,
        isReservedForGuest: false,
        restaurantId: restaurantId,
        reserveFrom: parsed.add(1, 'hour').format('HH:mm'),
        reserveUntil: parsed.add(2, 'hour').format('HH:mm'),
        description: '',
        firstName: isCheckedIn?.firstName,
        guestType: isCheckedIn?.roomNumber ? 'resident' : 'nonresident',
        lastName: isCheckedIn?.lastName,
        noOfGuests: guestCount,
        roomNo: isCheckedIn?.roomNumber,
        tableNumbers: [],
      };
      try {
        await client.mutate({
          mutation: CREATE_RESTAURANT_RESERVATION,
          context: { clientName: 'property_d' },
          fetchPolicy: 'network-only',
          variables: DetailsReservationPayload,
        });
        notificationStorage({
          type: SUCCESS,
          title: t('Thank You!') as string,
          description: t(
            'Your booking has been received. Our reservation team will get in touch with you soon',
          ) as string,
          redirect: availablePaths?.RESTAURANTS_BARS,
        });

        setTimeout(() => {
          closeDrawer();
        }, 4000);
      } catch (err) {
        notificationStorage({
          type: FAILURE,
          title: ERRORMSG as string,
          description: t('Your booking was not received.') as string,
          redirect: null,
        });
      }
    }
    if (tableModule?.type === VENDOR) {
      const isSlotAvailable = await getSlots();

      if (isSlotAvailable?.data?.getRestaurantAvailability?.data?.length == 0) {
        toggleNotification(true);
        notificationStorage({
          title: t('No Slots Available') as string,
          description: t('Please select another time or date to continue. '),
          redirect: null,
          type: FAILURE,
        });
        closeDrawer();
        return;
      } else {
        const attributesArray = isSlotAvailable?.data?.getRestaurantAvailability?.data.map(
          (item: any) => item?.attributes,
        );
        settimeExtractedArray(attributesArray || []);
        setAvailableSlots(true);
      }
    }
    toggleNotification(true);
  }, [
    getSlots,
    guestCount,
    isCheckedIn?.firstName,
    isCheckedIn?.lastName,
    isCheckedIn?.roomNumber,
    parsed,
    restaurantId,
    t,
    tableModule?.type,
  ]);
  const restaurantTiming = getTimings(queryResultEntity?.customAttributes);

  const onSeeMenuClick = useCallback(() => {
    setMenu(true);
    let link = null;
    if (queryResultEntity?.menuType === WEBURL) {
      link = queryResultEntity?.menu.split('=')[1].split(',')[0];
    }

    if (queryResultEntity?.menuType === S3) {
      link = `${ASSETS_URL}/${queryResultEntity?.menu.split('=')[1].split(',')[0]}`;
    }
    setmenuLink(link);
  }, [queryResultEntity?.menu, queryResultEntity?.menuType]);

  const closeBooking = () => {
    setIframeComponent(false);
  };

  const closeMenu = () => {
    setMenu(false);
  };

  useEffect(() => {
    if (!drawerStatus) {
      closeDrawer();
    }
  }, [drawerStatus]);

  const slotBookingHandler = async () => {
    const [date, time] = (selectedSpaSlots?.time && selectedSpaSlots?.time?.split('T')) || '';
    setTableBookingLoading(true);
    const randomString = Math.floor(Math.random() * 9000000000).toString();
    const tablePayload = {
      covers: guestCount || '',
      email: formik.values.email || '',
      hotelId: hotelId,
      idempotencyToken: randomString,
      first_name: formik.values.firstName || '',
      last_name: formik.values.lastName || '',
      phone: formik.values?.phoneNumber,
      venue_id: selectedRestaurant?.id || '',
      date: date || '',
      time: time || '',
    };

    try {
      const { data } = await client.mutate({
        mutation: CREATE_TABLE_RESERVATION_VENDOR,
        context: { clientName: 'integration_k' },
        fetchPolicy: 'network-only',
        variables: tablePayload,
      });

      setTimeout(() => {
        closeDrawer();
      }, 5000);
      notificationStorage({
        type: SUCCESS,
        title: t('Thank You!') as string,
        description: t(
          'Your booking has been received. Our reservation team will get in touch with you soon',
        ) as string,
      });
      toggleNotification(true);
    } catch (err) {
      notificationStorage({
        type: FAILURE,
        title: t(ERRORMSG) as string,
        description: t('Your booking was not received.') as string,
      });
      toggleNotification(true);
      setTableBookingLoading(false);
    }
    setTableBookingLoading(false);
  };

  const formik = useFormik({
    initialValues: {
      email: isCheckedIn?.email || '',
      phoneNumber: isCheckedIn?.phoneNumber || '',
      firstName: isCheckedIn?.firstName || '',
      lastName: isCheckedIn?.lastName || '',
    },
    validationSchema: getPhoneEmailValidationForTableReservation,
    onSubmit: slotBookingHandler,
    // enableReinitialize: true,
    validateOnMount: true,
  });

  const normalize = (str = '') =>
    str
      .trim()
      .toLowerCase()
      .replace(/^the\s+/, '');

  const countryDestructure: any = Countries?.find(
    (item) => normalize(item?.name) === normalize(hotelInfo?.location?.country || 'India'),
  )?.value?.toLowerCase();

  const countryCode = countryDestructure === 'uk' ? 'gb' : countryDestructure;

  return (
    <div
      className={cx(styles.listComponent, {
        [styles.listComponentMargin]: queryResultEntity?.cta?.status === ACTIVE && detailContent,
      })}
    >
      {!availableSlots && (
        <div className={styles.imageWrapper}>
          {queryResultEntity?.images?.length > 0 && (
            <CustomCarousel imageData={queryResultEntity} />
          )}
        </div>
      )}
      {detailContent && !availableSlots && (
        <>
          <div className={styles.listComponentData}>
            {queryResultEntity?.name && (
              <h2
                className={cx(styles.listComponentTitle, {
                  [styles.titleWithoutCTA]: !(queryResultEntity?.cta?.status === ACTIVE),
                })}
              >
                {t(`${queryResultEntity?.name}`)}
              </h2>
            )}
          </div>

          <div className={styles.gapList}>
            {queryResultEntity?.primaryCuisine && (
              <div className={styles.cuisineRowPrimaryCuisine}>
                <DishIcon className={styles.cuisineIcon} />
                <span className={styles.icon_text}>{queryResultEntity?.primaryCuisine}</span>
              </div>
            )}

            {restaurantTiming && (
              <>
                <div className={styles.timesWrapper}>
                  <TimeIcon className={styles.timeIcon} />
                  <p className={cx(styles.additionalInformation, styles.listComponentDataText)}>
                    {restaurantTiming?.value}
                  </p>
                </div>
              </>
            )}

            {queryResultEntity?.menuStatus === ACTIVE && (
              <div className={styles.timeRow}>
                <StyledButton
                  variant='outlined'
                  onClick={onSeeMenuClick}
                  className={styles.buttonView}
                >
                  {queryResultEntity?.ctaTitle || t('View Menu')}
                </StyledButton>
              </div>
            )}

            {queryResultEntity?.description && (
              <p className={styles.listComponentDataText}>
                {t(`${queryResultEntity?.description}`)}
              </p>
            )}

            {queryResultEntity?.additionalInformation && (
              <p className={styles.listComponentDataText}>
                {t(`${queryResultEntity?.additionalInformation}`)}
              </p>
            )}

            {(queryResultEntity?.contactNumber || queryResultEntity?.email) && (
              <PhoneEmail
                phone={queryResultEntity?.contactNumber as string}
                email={queryResultEntity?.email as string}
              />
            )}
          </div>

          {queryResultEntity?.cta?.status === ACTIVE && (
            <div
              style={{ position: 'fixed' }}
              className={cx('globals-actionCtaWrapper', {
                [styles.withoutImageButton]: !queryResultEntity?.images[0]?.ratio16to9,
                [styles.buttonNone]: timeSelectDrawer,
              })}
            >
              <StyledButton
                variant='contained'
                onClick={() => {
                  restaurantCtaNavigation(
                    queryResultEntity,
                    setDetailContent,
                    setTimeSelectDrawer,
                    setIframeComponent,
                  );
                }}
                className={styles.button}
                disabled={!btnDisabled}
              >
                {queryResultEntity?.cta?.ctaTitle || t('Book Now')}
              </StyledButton>
            </div>
          )}
        </>
      )}
      {timeSelectDrawer && !availableSlots && (
        <>
          <div className={styles.counterWrapper}>
            <p className={styles.counterTitle}>{t('No. of people')}</p>
            <PlusMinusInput
              value={guestCount}
              className={styles.plusMinusInput}
              onClickMinus={() => setGuestCount((count: any) => count - 1)}
              onClickPlus={() => setGuestCount((count: any) => count + 1)}
              minQuantity={1}
              valueClassName={styles.value}
            />
          </div>
          <div className={styles.timeWrapper}>
            <p className={styles.preferredTitle}>{t('Preferred Day & Time')}</p>
            <DateTimeSelectRestaurant
              setSelectedTime={setSelectedTime}
              selectedTime={selectedTime}
              handleSave={handleFindTable}
              showSchedules={undefined}
              buttonTitle={t('FIND A SLOT')}
              module={'restaurants_bars'}
              disableTimepiCketConfirmBtn={disableTimepiCketConfirmBtn}
              queryResultEntity={queryResultEntity}
              loading={tableLoading}
            />
          </div>
        </>
      )}

      {availableSlots && (
        <div className={styles.slotswrapper}>
          {!isCheckedIn?.firstName && (
            <StyledInput
              autoComplete='off'
              required
              className={styles.reservationInput}
              label={t('First Name')}
              variant='standard'
              name='firstName'
              id='firstName'
              value={formik.values.firstName}
              onChange={(e) => {
                formik.handleChange(e);
              }}
              error={
                (formik?.validateOnMount || formik.touched.firstName) &&
                Boolean(formik.errors.firstName)
              }
              helperText={
                (formik?.validateOnMount || formik.touched?.firstName) && formik.errors.firstName
                  ? t(formik.errors.firstName)
                  : null
              }
            />
          )}
          {!isCheckedIn?.lastName && (
            <StyledInput
              autoComplete='off'
              required
              className={styles.reservationInput}
              label={t('Last Name')}
              variant='standard'
              name='lastName'
              id='lastName'
              value={formik.values.lastName}
              onChange={(e) => {
                formik.handleChange(e);
              }}
              error={
                (formik?.validateOnMount || formik.touched.lastName) &&
                Boolean(formik.errors.lastName)
              }
              helperText={
                (formik?.validateOnMount || formik.touched?.lastName) && formik.errors.lastName
                  ? t(formik.errors.lastName)
                  : null
              }
            />
          )}
          {!isCheckedIn?.email && (
            <StyledInput
              autoComplete='off'
              required
              className={styles.reservationInput}
              label={t('Email')}
              variant='standard'
              name='email'
              id='email'
              value={formik.values.email}
              onChange={(e) => {
                formik.handleChange(e);
              }}
              error={
                (formik?.validateOnMount || formik.touched.email) && Boolean(formik.errors.email)
              }
              helperText={
                (formik?.validateOnMount || formik.touched?.email) && formik.errors.email
                  ? t(formik.errors.email)
                  : null
              }
            />
          )}
          {!isCheckedIn?.phoneNumber && (
            <MuiPhoneNumber
              className={styles.reservationInput}
              id='phoneNumber'
              name='phoneNumber'
              label={t('Phone Number')}
              required
              countryCodeEditable={true}
              fullWidth
              defaultCountry={countryCode || 'in'}
              disableAreaCodes
              autoFormat={true}
              value={formik.values.phoneNumber || ''}
              autoComplete='off'
              error={
                (formik?.validateOnMount || formik.touched.phoneNumber) &&
                Boolean(formik.errors.phoneNumber)
              }
              helperText={
                (formik?.validateOnMount || formik.touched?.phoneNumber) &&
                  formik.errors.phoneNumber
                  ? t(formik.errors.phoneNumber)
                  : null
              }
              onChange={(value) => {
                // formik.handleChange(e);
                formik.setFieldValue('phoneNumber', value);
              }}
              sx={{ '& svg': { height: '1.25rem' } }}
            />
          )}
          <div className={styles.slotsButtonwrapper}>
            {timeExtractedArray?.length > 0 &&
              timeExtractedArray?.map((timeExt: any, index: any) => (
                <StyledButton
                  key={index}
                  className={styles.sloteButton}
                  onClick={() => setSelectedSpaSlots(timeExt)}
                  variant={selectedSpaSlots?.epoch === timeExt?.epoch ? 'contained' : 'outlined'}
                >
                  {timeExt?.label}
                </StyledButton>
              ))}
          </div>
          <StyledButton
            className={styles.slotBookingButton}
            disabled={!(formik.isValid && formik.dirty) || isEmpty(selectedSpaSlots)}
            onClick={() => formik.handleSubmit()}
            loading={tableBookingLoading}
          >
            {t('Book Slot')}
          </StyledButton>
        </div>
      )}

      {(iframeComponent || menu) && (
        <CustomDrawer
          open={iframeComponent ? iframeComponent : menu}
          onClose={iframeComponent ? closeBooking : closeMenu}
          content={
            <IframeComponent
              src={iframeComponent ? queryResultEntity?.cta?.redirectUrl : menuLink}
              handledrawerState={iframeComponent ? setIframeComponent : setMenu}
              name={RESTAURANTS_AND_BARS}
            />
          }
          isIframe={true}
        />
      )}
    </div>
  );
};
