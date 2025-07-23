import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@styles/activityAndItinerary/activityAndItinerary.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useLazyQuery, useQuery, useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { client } from 'core/graphql/client';
import { useConfig } from 'utils/hooks/useConfiguration';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { Loader } from 'components/shared/Loaders/Loaders';
import Head from 'next/head';
import {
  hotelInfoStorage,
  toggleDetailsDrawer,
  toggleNotification,
  bookingDate,
} from 'storage/home.storage';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { HorizontalCalenderView } from 'components/shared/horizontalCalenderView/HorizontalCalenderView';
import { availablePaths } from 'utils/availablePaths';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import ShareButton from './shareItinerary';
import { GET_ITINERARY_ALL } from 'core/graphql/queries/GET_ITINERARY';
import { convertTo12HourFormatSmallCase, getCalendarLink } from 'utils/functions';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { ActivityDetailDrawer } from 'components/shared/ActivityDetailDrawer/ActivityDetailDrawer';
import { activeCheckInFlow } from 'storage/check-in.storage';
import { GET_ACTIVITIES, IGetActivitiesApiResponse } from 'core/graphql/queries/GET_ACTIVITY';
import dayjs from 'dayjs';
import { handleReservation } from 'utils/fetchReservation';
import { processStatusCode } from 'utils/processError';
import { getTrips } from 'storage/trips.storage';
import { generateItineraryHTML } from 'utils/generateItineraryHTML';
import AddEvent from 'assets/icons/addEvent.svg';

export { getStaticPaths };

const Itinerary = () => {
  const { t } = useTranslation(['common']);
  const config = useConfig();
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const checkedInData = getTrips();
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservations = getTrips();

  const reservationInfo = reservationData?.getReservation?.data;
  const today = dayjs();
  const toggleDetailsDrawerState = useReactiveVar(toggleDetailsDrawer);
  const activeCheckInFlowInfo = useReactiveVar(activeCheckInFlow);
  const useBookingDate = useReactiveVar(bookingDate);
  const [loading, setLoading] = useState<boolean>(true);
  const noToast = true;
  const navigate = useLocalizedRouter();
  const status = reservationInfo?.reservationStatus;
  const checkInDate =
    dayjs(checkedInData?.checkInDate as string) ||
    dayjs(reservationInfo?.details?.checkInDate as string);

  const goToTheNextStep = async () => {
    if (!reservationInfo) {
      const values: any = {
        lastName: reservations?.lastName,
        confirmationNumber: reservations?.reservationId,
        roomNo: reservations?.roomNumber,
      };
      let activeCheckInFlowInfo: any;
      if (reservations?.roomNumber && checkedInData?.checkedIn) {
        activeCheckInFlow(false);
        activeCheckInFlowInfo = false;
      } else {
        activeCheckInFlow(false);
        activeCheckInFlowInfo = true;
      }
      // const apiType = reservations?.roomNumber && !reservations?.reservationId ? false : true;
      await handleReservation({
        activeCheckInFlowInfo,
        values,
        hotelId,
        config,
        toggleNotification,
        setLoading,
        t,
        processStatusCode,
        navigate,
        goToTheNextStep,
        noToast,
      });
    }
  };

  useEffect(() => {
    if (!reservationInfo && reservations?.lastName) {
      goToTheNextStep();
    } else if (!reservations?.lastName) {
      navigate(availablePaths.HOME);
    }
  }, [reservations]);

  const currentDay = dayjs().startOf('day');

  // Determine initial check-in date
  const initialCheckInDate =
    dayjs(checkedInData?.checkInDate as string) ||
    dayjs(reservationInfo?.details?.checkInDate as string);

  // Use today's date if check-in date is in the past
  const initialSelectedDate = useBookingDate
    ? dayjs(useBookingDate)
    : initialCheckInDate.isBefore(currentDay) || !initialCheckInDate.isValid()
    ? currentDay
    : initialCheckInDate;

  // Format final selected date as string
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate.format('YYYY-MM-DD'));
  const [modifyActivityData, setModifyActivityData] = useState({});
  const hotelInformation = useReactiveVar(hotelInfoStorage);
  const hotelInfo = hotelInformation?.getPropertyDetailsByHotelId;

  const { data: activitiesData, loading: activitiesLoading } = useQuery<IGetActivitiesApiResponse>(
    GET_ACTIVITIES,
    {
      fetchPolicy: 'no-cache',
      context: { clientName: 'property_f' },
      variables: {
        hotelId: hotelId,
        id: '',
        startDate: '',
        endDate: '',
        categoryId: '',
        availability: '',
        priceType: '',
        location: '',
        limit: 0,
        pageToken: '',
        lang: locale === 'en' ? '' : locale,
      },
    },
  );

  const allActivities = activitiesData?.getActivitiesV2?.activities;

  const [showSelectedActivity, setShowSelectedActivity] = useState<any>();
  const [drawerstate, setDrawerState] = useState<string>('Content');

  const [fetchBookedActivities, { data: bookedActivities, loading: bookedActivitiesLoading }] =
    useLazyQuery(GET_ITINERARY_ALL, {
      fetchPolicy: 'no-cache',
      context: { clientName: 'integration_k' },
      variables: {
        // arrivalDate: '',
        // hotelId: hotelId,
        // firstName: '',
        lastName: checkedInData?.lastName,
        // reservationId: checkedInData?.reservationId || reservationInfo?.reservationId,
        // limit: 1,
        // activityBookingId: '',
        // departureDate: '',
        // pageToken: '',
        checkInTime: checkedInData?.checkInDate || '',
        hotelId: hotelId,
        checkOutTime: checkedInData?.checkOutDate || '',
        confirmationId: checkedInData?.reservationId || reservationInfo?.reservationId || '',
        reservationId: checkedInData?.reservationId || reservationInfo?.reservationId,
        roomNo: checkedInData?.roomNumber,
      },
    });

  const handleFetchActivities = () => {
    fetchBookedActivities();
  };

  useEffect(() => {
    handleFetchActivities();
  }, []);

  const bookedActivitiesDetails =
    bookedActivities?.getItineraries?.itineraries?.length > 0
      ? bookedActivities?.getItineraries?.itineraries?.map((booking: any) => {
          const slotId = booking?.slotId?.split('#') || '';
          const slotIdData = booking?.slotId || '';
          const activityBookingId = booking?.bookingId || '';
          const datePart = slotId?.[0];
          const fromTimeRaw = slotId?.[1];
          const toTimeRaw = slotId?.[2];
          const startDate = `${datePart?.slice(0, 4)}-${datePart?.slice(4, 6)}-${datePart?.slice(
            6,
            8,
          )}`;
          const startTime = convertTo12HourFormatSmallCase(fromTimeRaw?.replace(':', ':'));
          const endTime = convertTo12HourFormatSmallCase(toTimeRaw?.replace(':', ':'));

          return {
            ...booking,
            guests: booking.seats,
            startDate,
            startTime,
            endTime,
            slotId,
            activityBookingId,
            slotIdData,
          };
        })
      : [];

  // Add "Explore Activities" CTA
  bookedActivitiesDetails?.push({
    name: 'Explore Activities',
    type: 'CTAbtn',
    navigate: availablePaths?.ACTIVITY,
  });

  const closeDrawer = () => {
    setDrawerState('Content');
    toggleDetailsDrawer(false);
    setShowSelectedActivity(null);
  };

  const [finalHtmlContent, setFinalHtmlContent] = useState<string>('');

  useEffect(() => {
    if (
      bookedActivities?.getItineraries?.itineraries &&
      bookedActivities.getItineraries.itineraries.length > 0 &&
      allActivities
    ) {
      const imageUrl =
        hotelInformation?.getPropertyDetailsByHotelId?.hotel?.images?.[0]?.ratio16to9 &&
        `${ASSETS_URL || ''}/${
          hotelInformation.getPropertyDetailsByHotelId.hotel.images?.[0].ratio16to9
        }`;

      // Function to load image and return a promise
      const loadImage = (src: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(src);
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        });
      };

      // Only load image if URL exists
      const prepareContent = async () => {
        try {
          if (imageUrl) {
            await loadImage(imageUrl); // Wait for image to load
          }

          const html = generateItineraryHTML(
            checkedInData,
            bookedActivities.getItineraries?.itineraries || [],
            allActivities,
            imageUrl,
          );

          setFinalHtmlContent(html);
        } catch (error) {
          console.error('Error loading image or generating HTML:', error);
          // Optionally fallback to no image or show placeholder
          const fallbackHtml = generateItineraryHTML(
            checkedInData,
            bookedActivities.getItineraries?.itineraries || [],
            allActivities,
            '/fallback-image.png', // Optional placeholder
          );
          setFinalHtmlContent(fallbackHtml);
        }
      };

      prepareContent();
    }
  }, [bookedActivities, allActivities, hotelInformation]);

  useEffect(() => {
    setLoading(bookedActivitiesLoading || activitiesLoading);
  }, [bookedActivitiesLoading, activitiesLoading]);

  const exploreBtnIndependent = bookedActivitiesDetails?.filter(
    (item: any) => selectedDate === item?.startDate && item?.status === 'Confirmed',
  );

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Itinerary')}
        </title>
      </Head>
      <Header displayHome />
      <PageWrapper className={styles.pageWrapper} displayBottomMenu>
        <>
          <p className={styles.title}>
            {t('My Itinerary')}{' '}
            <ShareButton
              title={`My Itinerary at ${hotelName}`}
              text={`Hi ${checkedInData.firstName} ${checkedInData.lastName}! Here is your itinerary for the stay:`}
              url={'https://fairmont.hudinielevate-stage.io/en/fairmont-mumbai/ '}
              fileName='My Hotel Itinerary.pdf'
              htmlContent={finalHtmlContent}
            />
          </p>
          <HorizontalCalenderView
            reservationInfo={reservationInfo}
            checkedInData={checkedInData}
            selectedDate={useBookingDate || selectedDate}
            setSelectedDate={setSelectedDate}
          />
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className={cx(styles.tableWrapper, {})}>
                {bookedActivitiesDetails?.length > 0 &&
                  bookedActivitiesDetails
                    ?.filter(
                      (item: any) =>
                        item?.itineraryType === 'CheckIn' ||
                        (item?.status === 'Confirmed' &&
                          (useBookingDate || selectedDate) === item?.startDate) ||
                        item?.type === 'CTAbtn',
                    )
                    ?.sort((a: any, b: any) => {
                      // Combine date and time to parse properly
                      const dateA = new Date(`${a.startDate} ${a.startTime}`);
                      const dateB = new Date(`${b.startDate} ${b.startTime}`);
                      return dateA.getTime() - dateB.getTime();
                    })
                    ?.map((item: any, index: number) => {
                      const data = allActivities?.find(
                        (allItem) => item?.itineraryId === allItem?.id,
                      );
                      const today = dayjs()?.startOf('day');
                      const activityDate = dayjs(item.startDate, 'YYYY-MM-DD')?.startOf('day');

                      const isCompleted = activityDate.isBefore(today)
                        ? true
                        : activityDate.isSame(today)
                        ? dayjs().isAfter(
                            dayjs(
                              `${item.startDate} ${item.endTime?.toUpperCase()}`,
                              'YYYY-MM-DD hh:mm A',
                            ),
                          )
                        : false;

                      const hotelName = hotelInfo?.hotel?.name || config?.name;

                      return (
                        (item.startDate === selectedDate || item?.type === 'CTAbtn') && (
                          <div
                            key={index}
                            className={cx(styles.itineraryCard, {
                              [styles.btnExplore]: exploreBtnIndependent?.length === 0,
                            })}
                          >
                            <span className={cx(styles.tableDot, {})}></span>

                            {item?.type !== 'CTAbtn' && item.startDate === selectedDate ? (
                              <>
                                {item?.itineraryType === 'CheckIn' ? (
                                  <span className={cx(styles.tableTime, {})}>
                                    {item?.startTime}
                                  </span>
                                ) : (
                                  <div className={styles.addEvent}>
                                    <span className={cx(styles.tableTime, {})}>
                                      {item?.startTime} - {item?.endTime}
                                    </span>
                                    <span>
                                      {' '}
                                      <a {...getCalendarLink(item, item?.itineraryName, hotelName)}>
                                        <AddEvent />
                                      </a>
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={cx(styles.tableImageWrapper, {
                                    [styles.disabled]: isCompleted,
                                  })}
                                  onClick={() => {
                                    toggleDetailsDrawer(true);
                                    setShowSelectedActivity(data);
                                    setModifyActivityData(item);
                                  }}
                                >
                                  {data && data?.images?.length > 0 && (
                                    <StableImage
                                      className={styles.image}
                                      src={
                                        item?.itineraryType === 'CheckIn'
                                          ? `${ASSETS_URL}/${hotelInfo?.hotel?.images?.[0].ratio1to1}`
                                          : `${ASSETS_URL}/${data?.images?.[0]?.ratio16to9}`
                                      }
                                    />
                                  )}
                                  <div className={cx(styles.detailWrapper, {})}>
                                    <span className={cx(styles.cardTitle, {})}>
                                      {item?.itineraryType === 'CheckIn'
                                        ? `Check in to ${hotelInfo?.hotel?.name}`
                                        : data?.name}
                                    </span>
                                    <p className={cx(styles.cardDescription, {})}>
                                      {item?.itineraryType === 'CheckIn'
                                        ? hotelInfo?.hotel?.name
                                        : data?.description}
                                    </p>
                                    <span className={cx(styles.cardGuestCount, {})}>
                                      {item?.guests > 1
                                        ? `Guests: ${item.guests}`
                                        : `Guest: ${item.guests}`}
                                    </span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              item?.type === 'CTAbtn' && (
                                <div className={styles.StaybuttonWrapper}>
                                  <StyledButton
                                    variant='outlined'
                                    className={styles.button}
                                    onClick={() => item?.navigate && navigate(item?.navigate)}
                                  >
                                    {item?.name}
                                  </StyledButton>
                                </div>
                              )
                            )}
                            <br />
                          </div>
                        )
                      );
                    })}
                <p className={styles.exploreActivities}>
                  From curated dining options to <br />
                  unique activities, everything is just a tap away.
                </p>
              </div>
            </>
          )}
        </>
      </PageWrapper>
      {showSelectedActivity && modifyActivityData && (
        <CustomDrawer
          open={toggleDetailsDrawerState}
          onClose={closeDrawer}
          content={
            <ActivityDetailDrawer
              showSelectedActivity={showSelectedActivity}
              modifyBookingFlow
              drawerstate={drawerstate}
              setDrawerState={setDrawerState}
              closeDrawer={closeDrawer}
              guestActivityDetails={bookedActivitiesDetails}
              handleFetchActivities={handleFetchActivities}
              modifyActivityData={modifyActivityData}
              guestDetails={{
                firstName: reservationInfo?.details?.contactPerson?.firstName || '',
                lastName: reservationInfo?.details?.contactPerson?.lastName || '',
                email: reservationInfo?.details?.contactPerson?.email || '',
                phone: reservationInfo?.details?.contactPerson?.phoneNumber || '',
                reservationId:
                  reservationInfo?.confirmationId || reservationInfo?.reservationId || '',
                roomNo: reservationInfo?.roomTypes?.[0]?.roomNumber || '',
              }}
            />
          }
        />
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale as string;
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], i18nConfig)),
    },
  };
};

export default Itinerary;
