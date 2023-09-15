import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import {
  GET_RESTAURANT_DETAILS,
  IGetRestaurantDetailsResponse,
} from 'core/graphql/queries/GET_RESTAURTANT_DETAILS';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useCallback, useEffect, useState } from 'react';
import { restaurantListStorage, tableReservationStorage } from 'storage/table-reservation.storage';
import { getStaticPaths } from 'utils/getStatic';
import styles from '../../styles/restaurants-bars/restaurants-bars.module.scss';
import { useRouter } from 'next/router';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useCheckedIn } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { availablePaths } from 'utils/availablePaths';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL, HOTEL_ID } from 'core/graphql/endpoints';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import DishIcon from '@icons/dishIcon.svg';
import { Header } from 'components/shared/Header/Header';
import { diningOptions, toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
import {
  ACTIVE,
  DINING_OPTIONS,
  EMAIL,
  ENQUIRE,
  EXTERNALURL,
  IRD,
  OK,
  PHONE,
  S3,
  WEBURL,
} from 'utils/constants';
import { filterRestaurantList } from 'utils/functions';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { DetailDrawer } from 'components/shared/DetailDrawer/DetailDrawer';
import { CREATE_RESTAURANT_RESERVATION } from 'core/graphql/queries/GET_RESTAURANT_RESERVATION_DETAILS';
import { client } from 'core/graphql/client';
import { processError } from 'utils/processError';
import dayjs from 'dayjs';
import { downloadFile } from 'utils/downloadFile';
import { timeFormats } from 'utils/timeFormats';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { Notification } from 'components/shared/Notification/Notification';
import TimeIcon from '@icons/clockIcon.svg';
import PhoneIcon from '@icons/phone.svg';
import EmailIcon from '@icons/email.svg';
import cx from 'classnames';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import Head from 'next/head';
import { Loader } from 'components/shared/Loaders/Loaders';

export { getStaticPaths };

const RestaurantAndBars: React.FC = () => {
  const { t } = useTranslation(['ui-builder']);
  const [guestCount, setGuestCount] = useState(1);
  const [availableSlots, setAvailableSlots] = useState(false);
  const [timeSelectDrawer, setTimeSelectDrawer] = useState(false);
  const [detailContent, setDetailContent] = useState(true);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_YEAR_HOUR_MINUTE_AM),
  );
  const router = useRouter();
  const navigate = useLocalizedRouter();
  const [additionalInfoOpened, setAdditionalInfoOpened] = useState(false);
  const [additionalTimeOpened, setAdditionalTimeOpened] = useState(false);
  const [tableNumberDrawer, setTableNumberDrawer] = useState(false);
  const [tableDrawerState, setTableDrawerState] = useState(false);
  const restaurantDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const [selectedRestaurantData, setSelectedRestaurantData] = useState<any>();
  const { data, loading } = useQuery<IGetRestaurantDetailsResponse>(GET_RESTAURANT_DETAILS, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
  });

  const diningOptionSelected = useReactiveVar(diningOptions);

  const queryResultsData = data?.getRestaurantDetails?.restaurant;
  restaurantListStorage(queryResultsData?.map((item) => ({ id: item?.id, name: item?.name })));

  const onBackToTop = () => {
    window.scrollTo(0, 0);
  };

  const selectedListItem = (item: any) => {
    setSelectedRestaurantData(item);
    toggleDetailsDrawer(true);
  };

  useEffect(() => {
    diningOptionSelected.id === IRD && diningOptions(DINING_OPTIONS[1]);
  }, []);

  const filteredList = filterRestaurantList(queryResultsData, diningOptionSelected);

  const toggleAdditionalTimeOpened = useCallback(() => {
    setAdditionalTimeOpened((oldState) => !oldState);
  }, []);

  const queryResultEntity = selectedRestaurantData;
  const restaurantId = queryResultEntity?.id;

  function optimizeRestaurantHours(hoursData: any) {
    const optimizedHours: any = {};

    hoursData.forEach((hour: any) => {
      const { day, open, close } = hour;

      if (!optimizedHours[day]) {
        optimizedHours[day] = [{ open, close }];
      } else {
        const lastSlot = optimizedHours[day][optimizedHours[day].length - 1];
        if (lastSlot.close === open) {
          lastSlot.close = close;
        } else {
          optimizedHours[day].push({ open, close });
        }
      }
    });

    return optimizedHours;
  }

  const onCtaClick = useCallback(() => {
    if (queryResultEntity?.cta?.redirectOption === EXTERNALURL) {
      router.push(queryResultEntity?.cta?.redirectUrl);
    }
    if (queryResultEntity?.cta?.redirectOption === 'Restaurant Booking Flow') {
      tableReservationStorage({
        restaurantName: queryResultEntity?.name,
        id: queryResultEntity?.id,
        venueId:
          (queryResultEntity?.customAttributes && queryResultEntity?.customAttributes[0]?.value) ??
          '',
      });
      localStorage.setItem('restaurantId', JSON.stringify(queryResultEntity?.id) ?? '');
      setDetailContent(false);
      setTimeSelectDrawer(true);
    }
  }, [
    queryResultEntity?.cta?.redirectOption,
    queryResultEntity?.cta?.redirectUrl,
    queryResultEntity?.customAttributes,
    queryResultEntity?.id,
    queryResultEntity?.name,
    router,
  ]);

  const onSeeMenuClick = useCallback(() => {
    if (queryResultEntity?.menuType === WEBURL) {
      router.push(queryResultEntity?.menu.split('=')[1].split(',')[0]);
    }

    if (queryResultEntity?.menuType === S3) {
      downloadFile(
        `${ASSETS_URL}/${queryResultEntity?.menu.split('=')[1].split(',')[0]}`,
        'menu.pdf',
      );
    }
  }, [queryResultEntity?.menu, queryResultEntity?.menuType, router]);

  const toggleConfirmDrawerOpened = useCallback(() => {
    setTableNumberDrawer((oldState) => !oldState);
  }, []);

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    setTableDrawerState(false);
    setAdditionalTimeOpened(false);
    setAvailableSlots(false);
    setTimeSelectDrawer(false);
    setDetailContent(true);
    setGuestCount(1);
  };

  const optimizedHours = queryResultEntity && optimizeRestaurantHours(queryResultEntity.hours);

  const handleSave = () => {
    // create table reservation
    setTimeSelectDrawer(false);
  };

  const gotoThankyoupage = useCallback(async () => {
    const DetailsReservationPayload = {
      date: dayjs(selectedTime).format('YYYY-MM-DD'),
      exposure: 'No preference',
      hotelId: HOTEL_ID,
      isReservedForGuest: false,
      restaurantId: restaurantId ?? '',
      reserveFrom: dayjs(selectedTime, 'HH:mm').add(1, 'hour').format('HH:mm') ?? '',
      reserveUntil: dayjs(selectedTime, 'HH:mm').add(2, 'hour').format('HH:mm'),
      description: '',
      firstName: 'dev testing',
      guestType: 'resident',
      lastName: '',
      noOfGuests: guestCount,
      roomNo: '2',
      tableNumbers: [],
    };

    try {
      await client.mutate({
        mutation: CREATE_RESTAURANT_RESERVATION,
        context: { clientName: 'host_v3' },
        fetchPolicy: 'network-only',
        variables: DetailsReservationPayload,
      });
      toggleNotification(true);
      setTimeout(() => {
        closeDrawer();
      }, 4000);
    } catch (err) {
      processError(t, err as ApolloError);
    }
    // setLoading(false);
  }, [selectedTime, guestCount, t]);

  const restaurantDetail = () => (
    <div className={styles.listComponent}>
      {!availableSlots && (
        <div className={styles.imageWrapper}>
          <StableImage
            className={styles.bannerImage}
            src={
              queryResultEntity?.images && queryResultEntity?.images[0]
                ? `${ASSETS_URL}/${queryResultEntity?.images[0]?.master}`
                : undefined
            }
          />

          {queryResultEntity?.cta?.status === ACTIVE && (
            <StyledButton
              variant='contained'
              onClick={onCtaClick}
              className={cx(styles.button, {
                [styles.buttonNone]: timeSelectDrawer,
              })}
            >
              {queryResultEntity?.cta?.ctaTitle || t('BOOK NOW')}
            </StyledButton>
          )}
        </div>
      )}

      {detailContent && (
        <>
          {' '}
          <div className={styles.listComponentData}>
            {queryResultEntity?.name && (
              <h2 className={styles.listComponentTitle}>{t(`${queryResultEntity?.name}`)}</h2>
            )}
          </div>
          <div className={styles.gapList}>
            <div className={styles.firstRow}>
              {queryResultEntity?.primaryCuisine && (
                <div className={styles.cuisineRow}>
                  <DishIcon className={styles.cuisineIcon} />
                  <span className={styles.icon_text}>{queryResultEntity?.primaryCuisine}</span>
                </div>
              )}
              {/* {queryResultEntity?.location && (
            <a
              href={`https://maps.google.com/?q=${queryResultEntity?.location.latitude},${queryResultEntity?.location.longitude}`}
              target='_blank'
              className={styles.locationRow}
              rel='noreferrer'
            >
              <LocationIcon className={styles.locationIcon} />
              <span className={styles.icon_text}>
                {t(`${queryResultEntity?.location.addressLine1}`)}
              </span>
            </a>
          )} */}
            </div>

            {queryResultEntity?.hours && queryResultEntity?.hours.length > 0 && (
              <div className={styles.timeRow}>
                <TimeIcon className={styles.timeIcon} />
                <div className={styles.timeColumn}>
                  <div className={styles.timeRowWrapper}>
                    <div className={styles.timeRowShow}>
                      {Object.keys(optimizedHours)?.map((day) => {
                        const hoursToRender = additionalTimeOpened
                          ? optimizedHours[day]
                          : optimizedHours[day]?.slice(0, 1);

                        return (
                          <div className={styles.timeRowShowed} key={day}>
                            <p className={styles.additionalTimeEntityTable}>{day}:</p>
                            <div className={styles.timeRowOpen}>
                              {hoursToRender?.map((slot: any, index: number) => (
                                <span key={index} className={styles.additionalTimeEntity}>
                                  {slot?.open} - {slot?.close}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {queryResultEntity?.hours.length > 1 && (
                      <div
                        onClick={toggleAdditionalTimeOpened}
                        className={styles.timeShowMoreButton}
                      >
                        <ArrowBottomIcon
                          className={cx(styles.timeShowMoreIcon, {
                            [styles.timeShowMoreIconOpened]: additionalTimeOpened,
                          })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {queryResultEntity?.menuStatus === ACTIVE && (
                  <StyledButton
                    variant='outlined'
                    onClick={onSeeMenuClick}
                    className={styles.buttonView}
                  >
                    {queryResultEntity?.ctaTitle || t('VIEW MENU')}
                  </StyledButton>
                )}
              </div>
            )}

            {queryResultEntity?.description && (
              <p className={styles.listComponentDataText}>
                {t(`${queryResultEntity?.description}`)}
              </p>
            )}

            {/* {queryResultEntity?.additionalInformation && (
          <>
            <p
              className={cx(styles.additionalInformation, {
                [styles.additionalInformationOpened]: additionalInfoOpened,
              })}
            >
              {queryResultEntity?.additionalInformation}
            </p>

            <button onClick={toggleAdditionalInfoOpened} className={styles.readMore}>
              {additionalInfoOpened ? t('Read less') : t('Read more')}
            </button>
          </>
          )} */}

            <div className={styles.thirdRow}>
              <>
                {queryResultEntity?.contactNumber && (
                  <a href={`tel:${queryResultEntity?.contactNumber}`} className={styles.callRow}>
                    <PhoneIcon className={styles.callIcon} />
                    <span className={styles.icon_text}>{t('Call')}</span>
                  </a>
                )}
                {queryResultEntity?.email && (
                  <a href={`mailto:${queryResultEntity?.email}`} className={styles.emailRow}>
                    <EmailIcon className={styles.emailIcon} />{' '}
                    <span className={styles.icon_text}>{t('Email')}</span>
                  </a>
                )}
              </>
            </div>
          </div>
        </>
      )}

      {timeSelectDrawer && (
        <>
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
          <div className={styles.timeWrapper}>
            <DateTimeSelect
              setSelectedTime={setSelectedTime}
              selectedTime={selectedTime}
              handleSave={gotoThankyoupage}
              showSchedules={undefined}
              buttonTitle={t('FIND A TABLE')}
            />
          </div>
        </>
      )}
      {availableSlots && <></>}

      {queryResultEntity?.CTA?.type && (
        <StyledButton className={styles.bookTableBtn} variant='contained'>
          <>
            {queryResultEntity?.CTA?.type === OK && (
              <div onClick={() => router.back()}>{queryResultEntity?.CTA?.type}</div>
            )}
            {(queryResultEntity?.CTA?.type === ENQUIRE &&
              queryResultEntity?.CTA?.contact === EMAIL && (
                <a
                  href={`mailto:${queryResultEntity?.CTA?.emailId}`}
                  className={styles.emailRowOffers}
                >
                  <span>{queryResultEntity?.CTA?.type}</span>
                </a>
              )) ||
              (queryResultEntity?.CTA?.contact === PHONE && (
                <a
                  href={`tel:${queryResultEntity?.CTA?.phoneNumber}`}
                  className={styles.callRowOffers}
                >
                  {queryResultEntity?.CTA?.type}
                </a>
              ))}
          </>
        </StyledButton>
      )}
      <Notification
        title={t('Thank You!') as string}
        description={
          t(
            'Your booking has been received. Our reservation team will get in touch with you soon',
          ) as string
        }
        redirect={availablePaths?.RESTAURANTS_BARS}
        type='success'
      />
    </div>
  );

  return (
    <>
      <Head>
        <title>{t('Restaurants & Bars') as string}</title>
      </Head>
      <Header screenTitle={t('Restaurants & Bars') as string} displayHome />
      {loading ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper} displayBottomMenu>
          <div>
            {filteredList?.map((queryResultEntity: any) => (
              <ListComponentEntity
                key={queryResultEntity.id}
                queryResultEntity={queryResultEntity}
                selectedListItem={selectedListItem}
              />
            ))}
          </div>
        </PageWrapper>
      )}
      <DetailDrawer
        open={restaurantDetailsDrawerStatus}
        onClose={closeDrawer}
        content={restaurantDetail()}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['dining', 'common'], i18nConfig)),
    },
  };
};
export default RestaurantAndBars;
