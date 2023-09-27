import Head from 'next/head';
import React, { useEffect, useState, useMemo } from 'react';
import { HousekeepingItem } from 'components/pages/housekeeping/HousekeepingItem/HousekeepingItem';
import { Header } from 'components/shared/Header/Header';
import styles from '../../styles/housekeeping/housekeeping.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  GET_HOUSEKEEPING,
  IGetHousekeepingApiResponse,
} from 'core/graphql/queries/GET_HOUSEKEEPING';
import { IHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { ApolloError, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { housekeepingOptions } from 'storage/housekeeping.storage';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
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
import { CUSTOM, DATE, DATETIME, IMMEDIATE, TIME, TODAY, TOMORROW } from 'utils/constants';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { HOUSEKEEPING_ORDER } from 'core/graphql/queries/HOUSEKEEPING_ORDER';
import { HOTEL_ID } from 'core/graphql/endpoints';
import { toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
import { processError } from 'utils/processError';
import { Notification } from 'components/shared/Notification/Notification';
import { Loader } from 'components/shared/Loaders/Loaders';
import { availablePaths } from 'utils/availablePaths';
import {
  GET_RESERVATION_NO_LAST_NAME,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';
import { useCheckedIn } from 'storage/check-in.storage';

export { getStaticPaths };

const HouseKeeping: React.FC<IHamburgerProps & IHousekeepingProps> = () => {
  const { t } = useTranslation('housekeeping');
  const locale = useLocale();
  const checkinData = useCheckedIn();
  const reservationId = checkinData.reservationId;
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

  const [sendHousekeepingOrder] = useMutation(HOUSEKEEPING_ORDER, {
    context: { clientName: 'host_v4' },
  });

  const { data, loading } = useQuery<IGetHousekeepingApiResponse>(GET_HOUSEKEEPING, {
    context: { clientName: 'host_v1' },
    variables: {
      lang: locale === 'en' ? '' : locale,
    },
  });

  const { data: reservationData } = useQuery<IGetReservationApiResponse>(
    GET_RESERVATION_NO_LAST_NAME,
    {
      context: { clientName: 'rest' },
      variables: {
        confirmationNumber: reservationId,
      },
    },
  );

  const guestData = reservationData?.getReservation?.data?.guests[0];

  const combinedServiceRequestArray = useMemo(
    () => [...housekeepingInfoQuantity.selectedItems, ...housekeepingInfoCheckbox.selectedItems],
    [housekeepingInfoQuantity.selectedItems, housekeepingInfoCheckbox.selectedItems],
  );

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

  const handleOrder = async () => {
    try {
      const response = await sendHousekeepingOrder({
        variables: {
          bookingTime: dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2),
          guestName: `${guestData?.firstName} ${guestData?.lastName}`,
          serviceName: showSchedules?.name,
          requestType: showSchedules?.__typename,
          hotelId: HOTEL_ID,
          roomNo: reservationData?.getReservation?.data?.roomTypes[0]?.roomNumber,
          items: combinedServiceRequestArray
            ?.filter((item: any) => item?.quantity > 0)
            ?.map((el: any) => ({
              id: el?.itemId,
              name: el?.name + ' X ' + el?.quantity,
              instructions: '',
              scheduledFor: showSchedules?.scheduleActive
                ? showSchedules?.schedule?.includes(CUSTOM)
                  ? showSchedules?.customSchedule === DATE
                    ? dayjs(selectedTime).format(timeFormats.DAY_MONTH)
                    : showSchedules?.customSchedule === TIME
                    ? dayjs(selectedTime).format(timeFormats.HOURS_MINUTES_AM)
                    : showSchedules?.customSchedule === DATETIME
                    ? dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)
                    : dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)
                  : dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)
                : '',
            })),
        },
      });
      toggleNotification(true);
      setTimeout(() => {
        setDisabled(false);
        housekeepingQuantityStorage({ selectedItems: [] });
        housekeepingCheckboxStorage({ selectedItems: [] });
        setShowCalendar(false);
        setShowText(false);
        setSelectedTime(dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM));
        toggleDetailsDrawer(false);
      }, 4000);
    } catch (e) {
      processError(t, e as ApolloError);
    }
  };

  const drawerDetails = () => (
    <>
      <div className={styles.wrapper}>
        <div className={styles.confirmationWrapper}>
          <h2 className={styles.title}>{showSchedules?.name}</h2>
          <div className={styles.totalRequestsWrapper}>
            <div>
              {showSchedules && showSchedules?.maxQuantityActive ? (
                <HousekeepingQuantityItem
                  id={showSchedules?.id}
                  title={showSchedules?.name}
                  maxQuantity={showSchedules?.maxQuantity}
                  maxQuantityActive={showSchedules?.maxQuantityActive}
                  changeAlignment={false}
                />
              ) : (
                <>
                  {showSchedules?.items?.length > 0 && (
                    <>
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
                    </>
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
                      {dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)}
                    </div>
                  </div>
                </>
              )}

              {showSchedules?.scheduleActive && !showSchedules?.schedule?.includes(IMMEDIATE) && (
                <>
                  {!showCalendar && (
                    <div className={styles.calendarDateWrapper}>
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
      <Notification
        title={t('Thank You!') as string}
        description={t('Your request has been confirmed') as string}
        redirect={availablePaths?.HOUSEKEEPING}
        type='success'
      />
    </>
  );

  return (
    <>
      <Head>
        <title>{t('Services')}</title>
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
