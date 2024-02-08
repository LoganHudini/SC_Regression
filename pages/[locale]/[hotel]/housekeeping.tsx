import Head from 'next/head';
import React, { useEffect, useState, useMemo } from 'react';
import { HousekeepingItem } from 'components/pages/housekeeping/HousekeepingItem/HousekeepingItem';
import { Header } from 'components/shared/Header/Header';
import styles from '@styles/housekeeping/housekeeping.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  GET_HOUSEKEEPING,
  IGetHousekeepingApiResponse,
} from 'core/graphql/queries/GET_HOUSEKEEPING';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { housekeepingOptions } from 'storage/housekeeping.storage';
import { useTranslation } from 'react-i18next';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { IHousekeepingProps } from 'types/housekeeping.types';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { housekeepingQuantityStorage } from 'storage/housekeeping-quantity.storage';
import { housekeepingCheckboxStorage } from 'storage/housekeeping-checkbox.storage';
import { HousekeepingQuantityItem } from 'components/pages/housekeeping/HousekeepingQuantityItem/HousekeepingQuantityItem';
import { HousekeepingCheckboxItem } from 'components/pages/housekeeping/HousekeepingCheckboxItem/HousekeepingCheckboxItem';
import TimeIcon from '@icons/time-left.svg';
import InfoIcon from '@icons/info_icon.svg';
import {
  CMS,
  CUSTOM,
  DATE,
  DATETIME,
  ERRORMSG,
  FAILURE,
  IMMEDIATE,
  SERVICES,
  SUCCESS,
  TIME,
  TODAY,
  TOMORROW,
} from 'utils/constants';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { HOUSEKEEPING_ORDER } from 'core/graphql/queries/HOUSEKEEPING_ORDER';
import { HOTEL_ID } from 'core/graphql/endpoints';
import { toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { Loader } from 'components/shared/Loaders/Loaders';
import { availablePaths } from 'utils/availablePaths';
import { useCheckedIn } from 'storage/check-in.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { activeModule } from 'utils/functions';
import { HOUSEKEEPING_ORDER_TRANSACTION_HK } from 'core/graphql/queries/HOUSEKEEPING_ORDER_TRANSACTION_HK';

export { getStaticPaths };

const HouseKeeping: React.FC<IHousekeepingProps> = () => {
  const { t } = useTranslation('housekeeping');
  const locale = useLocale();
  const checkinData = useCheckedIn();
  const config = useConfig();
  const hotelId = config?.hotelId;
  const hotelName = config?.name;
  const [showServiceRequest, setShowServiceRequest] = useState([]);
  const [showSchedules, setShowSchedules] = useState<any>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showText, setShowText] = useState(false);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM),
  );
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const housekeepingInfoQuantity: any = useReactiveVar(housekeepingQuantityStorage);
  const housekeepingInfoCheckbox = useReactiveVar(housekeepingCheckboxStorage);
  const serviceRequesttDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const serviceModule: any = activeModule(config?.modules, SERVICES);
  const navigate = useLocalizedRouter();
  const [notificationState, setNotificationState] = useState<any>(false);

  const [sendHousekeepingOrder] = useMutation(HOUSEKEEPING_ORDER, {
    context: { clientName: 'host_v4' },
  });

  const [sendHousekeepingOrderIntegration] = useMutation(HOUSEKEEPING_ORDER_TRANSACTION_HK, {
    context: { clientName: 'integration_v1' },
  });

  const { data, loading } = useQuery<IGetHousekeepingApiResponse>(GET_HOUSEKEEPING, {
    skip: !hotelId,
    context: { clientName: 'host_v1' },
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const combinedServiceRequestArray = useMemo(
    () => [...housekeepingInfoQuantity.selectedItems, ...housekeepingInfoCheckbox.selectedItems],
    [housekeepingInfoQuantity.selectedItems, housekeepingInfoCheckbox.selectedItems],
  );

  useEffect(() => {
    if (!serviceModule || !checkinData?.checkedIn) {
      navigate(availablePaths?.HOME);
    }
  }, [navigate, t, serviceModule, checkinData]);

  useEffect(() => {
    if (!showSchedules?.isItemActive && !showSchedules?.maxQuantityActive) {
      setDisabled(true);
    } else if (combinedServiceRequestArray?.length > 0) {
      setDisabled(true);
      const value = combinedServiceRequestArray?.find((val: any) => val?.quantity > 0);
      if (showSchedules?.maxQuantityActive && value !== undefined) {
        setDisabled(true);
      } else if (value !== undefined) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    } else {
      setDisabled(false);
    }
  }, [combinedServiceRequestArray, showSchedules?.isItemActive, showSchedules?.maxQuantityActive]);

  useEffect(() => {
    if (data) {
      const selectedServiceRequests: any = data?.getServiceRequestDetails;
      const serviceRequest = selectedServiceRequests[houseKeepingOptionSelected?.label]?.filter(
        (el: any) => el?.isActive,
      );

      setShowServiceRequest(serviceRequest);
    }
  }, [data, houseKeepingOptionSelected?.label]);

  const handleClick = (selectedRequest: any) => {
    toggleDetailsDrawer(true);
    setShowSchedules(selectedRequest);
  };

  const handleClose = () => {
    toggleDetailsDrawer(false);
    setShowCalendar(false);
    setDisabled(false);
    setShowText(false);
    setSelectedTime(dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM));
    housekeepingQuantityStorage({ selectedItems: [] });
    housekeepingCheckboxStorage({ selectedItems: [] });
  };

  const showQuantityLabel = showSchedules?.items?.filter(
    (schedule: any) => schedule?.maxQuantityActive,
  );

  const handleShowSchedules = () => {
    if (showSchedules?.schedule?.includes(TODAY) && showSchedules?.schedule?.includes(TOMORROW)) {
      setShowCalendar(true);
    } else {
      setShowCalendar(true);
    }
  };

  const handleSave = () => {
    setShowText(true);
    setShowCalendar(false);
  };

  const serviceType: any = config?.modules?.find(
    (module: any) => module?.isActive && module?.code === SERVICES,
  );

  const handleOrder = async () => {
    try {
      const scheduledDateTimePayload = showSchedules?.scheduleActive
        ? showSchedules?.schedule?.includes(CUSTOM)
          ? showSchedules?.customSchedule === DATE
            ? dayjs(selectedTime, timeFormats.DAY_MONTH).format(timeFormats.DAY_MONTH)
            : showSchedules?.customSchedule === TIME
            ? dayjs(selectedTime, timeFormats.HOURS_MINUTES_AM).format(timeFormats.HOURS_MINUTES_AM)
            : showSchedules?.customSchedule === DATETIME
            ? dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2).format(
                timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2,
              )
            : dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2).format(
                timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2,
              )
          : dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2).format(
              timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2,
            )
        : '';
      if (serviceType?.type === CMS) {
        await sendHousekeepingOrder({
          variables: {
            bookingTime: dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2),
            guestName: checkinData?.name,
            serviceName: showSchedules?.name,
            requestType: showSchedules?.__typename,
            hotelId: HOTEL_ID,
            roomNo: checkinData?.roomNumber,
            items: combinedServiceRequestArray
              ?.filter((item: any) => item?.quantity > 0)
              ?.map((el: any) => ({
                id: el?.itemId,
                name: el?.name + ' X ' + el?.quantity,
                instructions: '',
                scheduledFor: scheduledDateTimePayload,
              })),
          },
        });
      } else {
        await sendHousekeepingOrderIntegration({
          variables: {
            hotelId: HOTEL_ID,
            roomNo: checkinData?.roomNumber,
            bookingId: checkinData?.reservationId,
            guestEmail: checkinData?.email,
            guestFirstName: checkinData?.name,
            items: combinedServiceRequestArray
              ?.filter((item: any) => item?.quantity > 0)
              ?.map((el: any) => ({
                code: el?.itemId,
                priorityId: '11',
                name: el?.name + ' X ' + el?.quantity,
                quantity: 1,
                scheduled: scheduledDateTimePayload,
              })),
          },
        });
      }
      toggleDetailsDrawer(false);
      setDisabled(false);
      housekeepingQuantityStorage({ selectedItems: [] });
      housekeepingCheckboxStorage({ selectedItems: [] });
      setShowCalendar(false);
      setShowText(false);
      setSelectedTime(dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM));
      setNotificationState({
        title: 'Thank You!',
        description: 'Your request has been confirmed.',
        redirect: null,
        type: SUCCESS,
      });
    } catch (e) {
      toggleDetailsDrawer(false);
      setNotificationState({
        title: ERRORMSG,
        description: 'Your request was not confirmed.',
        redirect: null,
        type: FAILURE,
      });
    }
    toggleNotification(true);
  };

  const drawerDetails = () => (
    <>
      <div className={styles.wrapper}>
        <div className={styles.confirmationWrapper}>
          <h2 className={styles.title}>{showSchedules?.name}</h2>
          <div className={styles.totalRequestsWrapper}>
            <div>
              {showSchedules && showSchedules?.maxQuantityActive && !showSchedules?.isItemActive ? (
                <HousekeepingQuantityItem
                  id={showSchedules?.id}
                  title={showSchedules?.name}
                  maxQuantity={showSchedules?.maxQuantity}
                  maxQuantityActive={showSchedules?.maxQuantityActive}
                  changeAlignment={false}
                  setNotificationState={setNotificationState}
                />
              ) : (
                <>
                  {showSchedules?.items?.length > 0 && showSchedules?.isItemActive && (
                    <div className={styles.wholeItemsWrapper}>
                      <div className={styles.itemsWrapper}>
                        <div>{t('Items Required')}</div>
                        {showQuantityLabel?.length > 0 && <div>{t('Quantity')}</div>}
                      </div>

                      {showSchedules?.items
                        ?.filter((schedule: any) => schedule?.maxQuantityActive)
                        ?.map((schedule: any) => (
                          <React.Fragment key={schedule?.id}>
                            <HousekeepingQuantityItem
                              id={schedule?.id}
                              title={schedule?.name}
                              maxQuantity={schedule?.maxQuantity}
                              maxQuantityActive={schedule?.maxQuantityActive}
                              changeAlignment={true}
                              setNotificationState={setNotificationState}
                            />
                          </React.Fragment>
                        ))}

                      {showSchedules?.items
                        ?.filter((schedule: any) => !schedule?.maxQuantityActive)
                        ?.map((schedule: any) => (
                          <React.Fragment key={schedule?.id}>
                            <HousekeepingCheckboxItem id={schedule?.id} title={schedule?.name} />
                          </React.Fragment>
                        ))}
                    </div>
                  )}
                </>
              )}

              {showSchedules?.scheduleActive && showSchedules?.schedule?.includes(IMMEDIATE) && (
                <>
                  <div className={styles.calendarDateWrapper}>
                    <div className={styles.calendarDateLabel}>
                      <span className={styles.icon}>
                        <TimeIcon />
                      </span>
                      {t('Scheduled Time')}
                    </div>

                    <div className={styles.calendarDateText}>
                      {dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2).format(
                        timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2,
                      )}
                    </div>
                  </div>
                </>
              )}

              {showSchedules?.scheduleActive && !showSchedules?.schedule?.includes(IMMEDIATE) && (
                <>
                  {!showCalendar && (
                    <div className={styles.calendarDateWrapper}>
                      <span className={styles.schedulerTitle}>
                        <InfoIcon />

                        {showText
                          ? t(
                              'The scheduler is set to begin 15 minutes from now, as this aligns with our standard delivery time.',
                            )
                          : t('Your items will be delivered in 15 minutes or less!')}
                      </span>
                      <div
                        className={styles.calendarDateLabel}
                        onClick={() => handleShowSchedules()}
                      >
                        <span className={styles.icon}>
                          <TimeIcon />
                        </span>
                        {showText ? t('Scheduled Time') : t('Schedule Time')}
                      </div>
                      {showText && !showCalendar && (
                        <div className={styles.calendarDateText}>
                          {dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2).format(
                            timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2,
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {showCalendar && (
                    <>
                      <DateTimeSelect
                        setSelectedTime={setSelectedTime}
                        selectedTime={selectedTime}
                        handleSave={handleSave}
                        showSchedules={showSchedules}
                        buttonTitle={t('Save')}
                      />
                    </>
                  )}
                </>
              )}

              {!showCalendar && (
                <StyledButton disabled={!disabled} onClick={() => handleOrder()}>
                  {t('PLACE ORDER')}
                </StyledButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Services')}
        </title>
      </Head>
      <Header displayHome screenTitle={t('Services') as string} />
      <div className={styles.housekeepingWrapper}>
        {loading ? (
          <>
            <div className={styles.container}>
              <Loader />
            </div>
          </>
        ) : (
          <>
            <PageWrapper displayBottomMenu className={styles.pageWrapper}>
              <div className={styles.container}>
                {showServiceRequest?.length !== 0 ? (
                  showServiceRequest?.map((item: any) => (
                    <div className={styles.margin} key={item.id}>
                      <HousekeepingItem housekeepingItem={item} handleClick={handleClick} />
                    </div>
                  ))
                ) : (
                  <div className={styles.information}>{t('No information found')}</div>
                )}
              </div>
            </PageWrapper>
          </>
        )}
        <Notification
          title={notificationState?.title}
          description={notificationState?.description}
          redirect={notificationState?.redirect}
          type={notificationState?.type}
        />
        <CustomDrawer
          open={serviceRequesttDetailsDrawerStatus}
          onClose={() => handleClose()}
          content={drawerDetails()}
        />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['housekeeping', 'common'], i18nConfig)),
    },
  };
};

export default HouseKeeping;
