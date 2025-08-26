/* eslint-disable react-hooks/exhaustive-deps */
import { useLazyQuery, useQuery, useReactiveVar } from '@apollo/client';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useCallback, useState } from 'react';
import { getStaticPaths } from 'utils/getStatic';
import styles from '@styles/spa/spa.module.scss';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import {
  notificationStorage,
  toggleDetailsDrawer,
  toggleHamburgerMenuDrawer,
  toggleNotification,
} from 'storage/home.storage';
import { activeItems, moduleType, restaurantId, timeExtract } from 'utils/functions';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';
import { GET_SPA_DETAILS } from 'core/graphql/queries/GET_SPA_DETAILS';
import Head from 'next/head';
import { spaCategoryList, spaInformationStorage } from 'storage/spa.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import produce from 'immer';
import { HOTEL_ID } from 'core/graphql/endpoints';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import {
  ACTIVE,
  ERRORMSG,
  SPA_BOOKING_FLOW,
  SPA_TREATMENTS,
  SPA,
  CMS,
  GenderOptions,
  FAILURE,
  SUCCESS,
  SPA_TREATMENT_LINK,
} from 'utils/constants';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { client } from 'core/graphql/client';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useCheckedIn } from 'storage/check-in.storage';
import { CREATE_SPA_ORDER } from 'core/graphql/queries/CREATE_SPA_RESERVATION';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { useCurrency } from 'utils/hooks/useCurrency';
import cx from 'classnames';
import { GET_SLOT_DETAILS } from 'core/graphql/queries/GET_AVAILABLE_SPA_SLOTS';
import { isEmpty } from 'lodash';
import { CREATE_SPA_BOOKING } from 'core/graphql/queries/CREATE_SPA_REQUEST';
import { StyledFormControl } from 'components/shared/StyledFormControl/StyledFormControl';
import { FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import DropDown from '@icons/dropDownIcon.svg';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { useFormik } from 'formik';
import { getPhoneEmailValidation } from 'validation/get-reservation.validation';
import { analyticsEvent } from 'utils/gtag';
import { PhoneEmail } from 'components/shared/PhoneEmail/PhoneEmail';
import NoInformation from 'components/shared/NoInformation/NoInformation';
import { ListCounter } from 'components/shared/ListCounter/ListCounter';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { availablePaths } from 'utils/availablePaths';

export { getStaticPaths };

const Spa: React.FC = () => {
  const { t } = useTranslation(['spa']);
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const locale = useLocale();
  const spaInfo = useReactiveVar(spaInformationStorage);
  const spaDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const currency = useCurrency();
  const [timeSelectDrawer, setTimeSelectDrawer] = useState(false);
  const [detailContent, setDetailContent] = useState(true);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM),
  );
  const isCheckedIn = useCheckedIn();
  const currentYear = new Date().getFullYear();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guestCount, setGuestCount] = useState(1);
  const [timeExtractedArray, settimeExtractedArray] = useState([]);
  const [spaBooking, setspaBooking] = useState(false);
  const spaModule: any = moduleType(config?.modules, SPA);
  const [availableSlots, setAvailableSlots] = useState(false);
  const [selectedSpaSlots, setSelectedSpaSlots] = useState<any>({});
  const [spaBookingLoading, setSpaBookingLoading] = useState<any>(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!spaInfo) {
      setRedirecting(true);
      navigate(availablePaths.SPA_INFO);
    }
  }, [spaInfo, navigate]);

  const { data, loading } = useQuery(GET_SPA_DETAILS, {
    skip: !hotelId,
    context: { clientName: 'property_a' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const spaInformation = activeItems(data?.getSpaDetails?.spa)?.find(
    (info: any) => info?.id === spaInfo?.selectedSpaInfoId,
  );

  const spaTreatmentsList = activeItems(data?.getSpaDetails?.treatments)?.filter(
    (treatment: any) =>
      treatment?.spaId === spaInfo?.selectedSpaInfoId &&
      treatment?.spaCategoryId === spaInfo?.selectedSpaCategoryId,
  );

  let spaCategory: any = [];
  data?.getSpaDetails?.categories?.forEach((category: any) => {
    activeItems(data?.getSpaDetails?.treatments)?.forEach((treatment: any) => {
      if (
        treatment?.spaId === spaInfo?.selectedSpaInfoId &&
        category?.id === treatment?.spaCategoryId &&
        !spaCategory?.includes(category)
      ) {
        spaCategory = [...spaCategory, category];
      }
    });
  });

  spaCategoryList(spaCategory);
  const selectedSpaItem = spaTreatmentsList?.find(
    (item: any) => item?.id === spaInfo?.selectedSpaTreatmentId,
  );

  useEffect(() => {
    data?.getSpaDetails?.spa &&
      spaInformationStorage({
        selectedSpaInfoName:
          spaInfo?.selectedSpaInfoName ?? activeItems(data?.getSpaDetails?.spa)[0]?.name,
        selectedSpaInfoId:
          spaInfo?.selectedSpaInfoId ?? activeItems(data?.getSpaDetails?.spa)[0]?.id,
        selectedSpaCategoryName: spaCategory[0]?.name,
        selectedSpaCategoryId: spaCategory[0]?.id,
      });
  }, [
    data?.getSpaDetails?.spa,
    spaCategory[0],
    spaInfo?.selectedSpaInfoId,
    spaInfo?.selectedSpaInfoName,
  ]);

  const selectedSpa = (treatment: any) => {
    spaInformationStorage(
      produce(spaInformationStorage(), (draft: any) => {
        if (draft) {
          draft.selectedSpaTreatmentName = treatment?.name;
          draft.selectedSpaTreatmentId = treatment?.id;
        }
      }),
    );
    toggleDetailsDrawer(true);
    toggleHamburgerMenuDrawer(false);
    setDetailContent(true);
  };

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    setAvailableSlots(false);
    setSelectedSpaSlots({});
    spaInformationStorage(
      produce(spaInformationStorage(), (draft) => {
        null;
      }),
    );
    setTimeSelectDrawer(false);
  };

  const closeSpa = () => {
    setspaBooking(false);
  };

  const treatmentLink = selectedSpaItem?.customAttributes?.find(
    (attr: any) => attr.key === SPA_TREATMENT_LINK,
  )?.value;

  const onCtaClick = () => {
    if (spaInformation?.cta?.redirectOption === SPA_BOOKING_FLOW) {
      // to be enabled later
      // if (!isCheckedIn?.checkedIn) {
      //   notificationStorage({
      //     type: FAILURE,
      //     title: t('Access Denied.'),
      //     description: t('Please connect to room to reserve spa treatments.') as string,
      //   });
      //   toggleNotification(true);
      // } else {
      setDetailContent(false);
      setTimeSelectDrawer(true);
      // }
    } else if (treatmentLink) {
      analyticsEvent({
        action: 'spa_redirect',
        category: 'Spa',
        title: spaInformation?.name,
      });
      setspaBooking(true);
    } else if (spaInformation?.cta?.redirectUrl) {
      analyticsEvent({
        action: 'spa_redirect',
        category: 'Spa',
        title: spaInformation?.name,
      });
      setspaBooking(true);
    }
  };

  const handleSpaReservation = useCallback(async () => {
    const parsedTime = dayjs(`${selectedTime} ${currentYear}`, 'DD MMM:hh:mm:A YYYY');

    if (spaModule?.type === CMS) {
      const DetailsReservationPayload = {
        bookingId: isCheckedIn?.reservationId,
        hotelId: HOTEL_ID,
        bookingTime: dayjs().format(timeFormats.DATE_TIME),
        roomNo: isCheckedIn?.roomNumber,
        guestName: `${isCheckedIn?.firstName} ${isCheckedIn?.lastName}`,
        guestType: isCheckedIn?.roomNumber ? 'resident' : 'nonresident',
        numberOfGuest: guestCount,
        pax: '',
        scheduledDate: parsedTime.format(timeFormats.YEAR_MONTH_DAY),
        scheduledTime: parsedTime.format(timeFormats.RAILWAY_TIME),
        treatmentDuration: selectedSpaItem?.duration[currentIndex]?.duration as string,
        totalAmount: selectedSpaItem?.duration[currentIndex]?.price,
        spaId: selectedSpaItem?.spaId,
        items: [
          {
            name: selectedSpaItem?.name,
            treatmentDuration: selectedSpaItem?.duration[currentIndex]?.duration,
            amount: selectedSpaItem?.duration[currentIndex]?.price,
            description: '',
          },
        ],
        spaName: selectedSpaItem?.name,
      };

      try {
        await client.mutate({
          mutation: CREATE_SPA_ORDER,
          context: { clientName: 'property_d' },
          fetchPolicy: 'network-only',
          variables: DetailsReservationPayload,
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
      } catch (err) {
        notificationStorage({
          type: FAILURE,
          title: t(ERRORMSG) as string,
          description: t('Your booking was not received.') as string,
        });
      }
      toggleNotification(true);
    } else {
      const isSlotAvailable = await getSlots();

      if (!isSlotAvailable?.data?.getSpaSlotAvailability) {
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
        settimeExtractedArray(
          isSlotAvailable?.data?.getSpaSlotAvailability?.length > 0
            ? timeExtract(isSlotAvailable?.data?.getSpaSlotAvailability)
            : [],
        );
      }
      setAvailableSlots(true);
      setTimeSelectDrawer(false);
    }
  }, [
    selectedTime,
    currentYear,
    restaurantId,
    isCheckedIn?.lastName,
    isCheckedIn?.roomNumber,
    guestCount,
  ]);

  const timePart = selectedTime?.split(':')?.slice(1)?.join(':');
  const time = dayjs(timePart, 'hh:mm:A');
  const totalMinutes = time.hour() * 60 + time.minute();

  const [getSlots, { loading: spaLoading }] = useLazyQuery(GET_SLOT_DETAILS, {
    context: { clientName: 'integration_d' },
    variables: {
      date: (() => {
        const validDate = dayjs(selectedTime).isValid() ? dayjs(selectedTime) : dayjs();
        return validDate.year(currentYear).format(timeFormats.YEAR_MONTH_DAY);
      })(),
      hotelId: hotelId,
      requestType: '601',
      treatmentId: selectedSpaItem?.code,
      startTime: totalMinutes || '',
    },
    fetchPolicy: 'no-cache',
  });

  const slotBookingHandler = async () => {
    setSpaBookingLoading(true);
    const validDate = dayjs(selectedTime).isValid() ? dayjs(selectedTime) : dayjs();
    const formattedDate = validDate.year(currentYear).format(timeFormats.YEAR_MONTH_DAY);
    const spaPayload = {
      customerNotes: '',
      duration:
        selectedSpaItem?.duration?.[currentIndex]?.duration ||
        selectedSpaItem?.duration?.[0]?.duration ||
        '',

      hotelId: hotelId,
      requestType: '601',
      date: formattedDate,
      treatmentId: selectedSpaItem?.code,
      startTime: selectedSpaSlots?.startTime,
      technicianId: parseInt(selectedSpaSlots.technicianId),
      firstName: formik.values.firstName || '',
      lastName: formik.values.lastName || '',
      emailAddress: formik.values.email || '',
      roomNo: isCheckedIn?.checkedIn ? isCheckedIn?.roomNumber : '',
      genderPreference: formik?.values?.gender || '',
      mobileNumber: formik?.values?.phoneNumber || '',
    };

    try {
      const { data } = await client.mutate({
        mutation: CREATE_SPA_BOOKING,
        context: { clientName: 'integration_d' },
        fetchPolicy: 'network-only',
        variables: spaPayload,
      });

      if (data?.createSpaAppointment?.message === 'Failed - to Book the Spa') {
        throw new Error('Failed to book the spa appointment');
      }

      if (!data?.createSpaAppointment) {
        throw new Error('Invalid response from server');
      }

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
    } catch (err) {
      notificationStorage({
        type: FAILURE,
        title: t(ERRORMSG) as string,
        description: t('Your booking was not received.') as string,
      });
      setSpaBookingLoading(false);
    }
    toggleNotification(true);
    setSpaBookingLoading(false);
  };

  const formik = useFormik({
    initialValues: {
      firstName: isCheckedIn?.firstName || '',
      lastName: isCheckedIn?.lastName || '',
      email: isCheckedIn?.email || '',
      phoneNumber: isCheckedIn?.phoneNumber || '',
      gender: '',
    },
    validationSchema: getPhoneEmailValidation,
    onSubmit: slotBookingHandler,
    // enableReinitialize: true,
    validateOnMount: true,
  });

  const SpaDetails = () => {
    return (
      <div>
        {detailContent && (
          <div
            className={cx({
              [styles.listComponentMargin]: spaInformation?.cta?.status === ACTIVE,
            })}
          >
            {selectedSpaItem?.images?.length > 0 && <CustomCarousel imageData={selectedSpaItem} />}

            <div className={styles.wrapper}>
              {selectedSpaItem?.name && (
                <h2 className={styles.detailComponentTitle}>{t(`${selectedSpaItem?.name}`)}</h2>
              )}

              {selectedSpaItem?.duration?.length > 0 && (
                <>
                  {selectedSpaItem?.duration?.map((duration: any, index: number) => (
                    <p key={index + duration?.duration} className={styles.detailComponentDuration}>
                      <span className={styles.currency}>
                        {currency}
                        {'  '}
                      </span>
                      {Number(duration?.price)?.toLocaleString('en-US')}
                      {'   '}|{'   '}
                      {duration?.duration} {t('Min')}
                    </p>
                  ))}
                </>
              )}

              {selectedSpaItem?.description && (
                <p className={styles.detailComponentDescription}>
                  {t(`${selectedSpaItem?.description}`)}
                </p>
              )}
              {(spaInformation?.contact?.phone || spaInformation?.contact?.email) && (
                <PhoneEmail
                  phone={spaInformation?.contact?.phone}
                  email={spaInformation?.contact?.email}
                />
              )}
            </div>
            {spaInformation?.cta?.status === ACTIVE && (
              <div style={{ position: 'fixed' }}>
                <StyledButton
                  variant='contained'
                  onClick={onCtaClick}
                  className={cx(styles.button, 'globals-actionCtaWrapper')}
                >
                  {spaInformation?.cta?.ctaTitle || t('Book Now')}
                </StyledButton>
              </div>
            )}
          </div>
        )}

        {timeSelectDrawer && (
          <div className={styles.timeSelectDrawerWrapper}>
            <div className={styles.counterWrapper}>
              <p className={styles.counterTitle}>{t('No. of people')}</p>
              <PlusMinusInput
                value={guestCount}
                className={styles.plusMinusInput}
                onClickMinus={() => setGuestCount((count) => count - 1)}
                onClickPlus={() => setGuestCount((count) => count + 1)}
                minQuantity={1}
                valueClassName={styles.value}
              />
            </div>
            <div className={styles.counterWrapper}>
              <p className={styles.counterTitle}>{t('Duration')}</p>
              <ListCounter
                values={selectedSpaItem?.duration}
                className={styles.plusMinusInput}
                valueClassName={styles.value}
                setCurrentIndex={setCurrentIndex}
                currentIndex={currentIndex}
              />
            </div>

            <div className={styles.timeWrapper}>
              <p className={styles.preferredTitle}>{t('Preferred Date & Time')}</p>
              <DateTimeSelect
                loading={spaLoading}
                setSelectedTime={setSelectedTime}
                selectedTime={selectedTime}
                handleSave={handleSpaReservation}
                showSchedules={undefined}
                buttonTitle={spaModule?.type === 'CMS' ? t('Book now') : t('Find available slots')}
                buttonStyle={styles.buttonPicker}
                module={'spa'}
              />
            </div>
          </div>
        )}
        {availableSlots && (
          <div className={styles.slotswrapper}>
            <div>
              <StyledFormControl
                required
                className={styles.guestDataInput}
                variant='standard'
                sx={{ m: 1, minWidth: '100%' }}
                error={
                  (formik?.validateOnMount || formik.touched.gender) &&
                  Boolean(formik.errors.gender)
                }
              >
                <InputLabel>{t('Gender')}</InputLabel>
                <Select
                  className={styles.guestDataInput}
                  label={t('Gender')}
                  variant='standard'
                  name={'gender'}
                  id={'gender'}
                  value={formik?.values?.gender || ''}
                  onChange={(e: any) => {
                    formik.handleChange(e);
                  }}
                  IconComponent={DropDown}
                >
                  {GenderOptions?.map((item: any) => {
                    return (
                      <MenuItem value={item?.value} key={item?.value}>
                        <em>{t(item?.label)}</em>
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText>
                  {(formik?.validateOnMount || formik.touched.gender) &&
                    formik.errors.gender &&
                    t(String(formik.errors.gender))}
                </FormHelperText>
              </StyledFormControl>
            </div>
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
            {isCheckedIn?.lastName && (
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
              <StyledInput
                autoComplete='off'
                required
                className={styles.reservationInput}
                label={t('Phone Number')}
                variant='standard'
                name='phoneNumber'
                id='phoneNumber'
                value={formik.values.phoneNumber}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
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
              />
            )}
            <div className={styles.slotsButtonwrapper}>
              {timeExtractedArray?.length > 0 &&
                timeExtractedArray?.map((timeExt: any, index: any) => (
                  <StyledButton
                    key={index}
                    className={styles.sloteButton}
                    onClick={() => setSelectedSpaSlots(timeExt)}
                    variant={selectedSpaSlots?.index === timeExt?.index ? 'contained' : 'outlined'}
                  >
                    {timeExt?.displayTime}
                  </StyledButton>
                ))}
            </div>
            <StyledButton
              className={styles.slotBookingButton}
              disabled={!(formik.isValid && formik.dirty) || isEmpty(selectedSpaSlots)}
              onClick={() => formik.handleSubmit()}
              loading={spaBookingLoading}
            >
              {t('Book Slot')}
            </StyledButton>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Spa')}
        </title>
      </Head>
      <Header screenTitle={t('Spa') as string} displayBackButton />
      {loading || redirecting ? (
        <Loader />
      ) : (
        <PageWrapper
          className={styles.pageWrapper}
          displayBottomMenu={spaCategory && spaTreatmentsList}
        >
          <div>
            {spaTreatmentsList?.length > 0 ? (
              spaTreatmentsList?.map((selectedSpaItem: any) => (
                <ListComponentEntity
                  key={selectedSpaItem.id}
                  queryResultEntity={selectedSpaItem}
                  selectedListItem={selectedSpa}
                />
              ))
            ) : (
              <NoInformation
                message={t(
                  'At the moment, there are no spa services available. Please check back later. We appreciate your understanding.',
                )}
              />
            )}
          </div>
        </PageWrapper>
      )}

      {spaBooking ? (
        <CustomDrawer
          open={spaBooking}
          onClose={closeSpa}
          content={
            <IframeComponent
              src={treatmentLink ?? spaInformation?.cta?.redirectUrl}
              handledrawerState={setspaBooking}
              name={SPA_TREATMENTS}
            />
          }
          isIframe={true}
        />
      ) : (
        <CustomDrawer open={spaDetailsDrawerStatus} onClose={closeDrawer} content={SpaDetails()} />
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['errors', 'spa', 'common'], i18nConfig)),
    },
  };
};
export default Spa;
