import { useQuery, useReactiveVar } from '@apollo/client';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import {
  GET_RESTAURANT_DETAILS,
  IGetRestaurantDetailsResponse,
} from 'core/graphql/queries/GET_RESTAURTANT_DETAILS';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useCallback, useEffect, useState } from 'react';
import {
  restaurantListStorage,
  selectedRestaurantStorage,
} from 'storage/table-reservation.storage';
import { getStaticPaths } from 'utils/getStatic';
import styles from '@styles/restaurants-bars/restaurants-bars.module.scss';
import { useRouter } from 'next/router';
import { useCheckedIn } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { availablePaths } from 'utils/availablePaths';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL, HOTEL_ID } from 'core/graphql/endpoints';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import DishIcon from '@icons/dishIcon.svg';
import { Header } from 'components/shared/Header/Header';
import {
  diningOptions,
  diningHeaders,
  toggleDetailsDrawer,
  toggleNotification,
} from 'storage/home.storage';
import {
  ACTIVE,
  EMAIL,
  ENQUIRE,
  ERRORMSG,
  FAILURE,
  IN_ROOM_DINING,
  OK,
  PHONE,
  S3,
  SUCCESS,
  WEBURL,
  RESTAURANTS_AND_BARS,
} from 'utils/constants';
import {
  activeModule,
  getTimings,
  restaurantCtaNavigation,
  uniqueDiningOption,
} from 'utils/functions';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { CREATE_RESTAURANT_RESERVATION } from 'core/graphql/queries/GET_RESTAURANT_RESERVATION_DETAILS';
import { client } from 'core/graphql/client';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { Notification } from 'components/shared/Notification/Notification';
import TimeIcon from '@icons/clockIcon.svg';
import PhoneIcon from '@icons/phone.svg';
import EmailIcon from '@icons/email.svg';
import cx from 'classnames';
import Head from 'next/head';
import { Loader } from 'components/shared/Loaders/Loaders';
import { isEmpty } from 'lodash';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { PlaceholderImage } from 'components/shared/PlaceholderImage/PlaceholderImage';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';

export { getStaticPaths };

const RestaurantAndBars: React.FC = () => {
  const { t } = useTranslation(['ui-builder']);
  const isCheckedIn = useCheckedIn();
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const [guestCount, setGuestCount] = useState(1);
  const [availableSlots, setAvailableSlots] = useState(false);
  const [timeSelectDrawer, setTimeSelectDrawer] = useState(false);
  const [detailContent, setDetailContent] = useState(true);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM),
  );
  const [iframeComponent, setIframeComponent] = useState(false);
  const [menu, setMenu] = useState(false);
  const [menuLink, setmenuLink] = useState(null);
  const router = useRouter();
  const config = useConfig();
  const restaurantDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const initialSelected = useReactiveVar(selectedRestaurantStorage);
  const currentYear = new Date().getFullYear();
  const [selectedRestaurantData, setSelectedRestaurantData] = useState<any>();
  const [errorNotification, setErrorNotification] = useState(false);
  const irdModule: any = activeModule(config?.modules, IN_ROOM_DINING);

  const { data, loading } = useQuery<IGetRestaurantDetailsResponse>(GET_RESTAURANT_DETAILS, {
    skip: !hotelId,
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
    variables: {
      lang: locale === 'en' ? '' : locale,
      hotelId: hotelId,
    },
  });

  const diningOptionSelected = useReactiveVar(diningOptions);

  const queryResultsData: any = data?.getRestaurantDetails?.restaurant;
  restaurantListStorage(queryResultsData?.map((item: any) => ({ id: item?.id, name: item?.name })));

  const selectedListItem = (item: any) => {
    setSelectedRestaurantData(item);
    toggleDetailsDrawer(true);
  };

  useEffect(() => {
    queryResultsData?.length != 0 &&
      isEmpty(diningOptionSelected) &&
      diningOptions(data?.getRestaurantDetails?.restaurant[0]);
    if (!isEmpty(initialSelected)) {
      diningOptions(initialSelected);
      setSelectedRestaurantData(initialSelected);
      setTimeout(() => {
        toggleDetailsDrawer(true);
      }, 1000);
    }
  }, [queryResultsData]);

  const filteredList = queryResultsData;
  const uniqueFilteredDiningOptions = uniqueDiningOption(queryResultsData);

  useEffect(() => {
    if (uniqueFilteredDiningOptions?.length > 0) {
      diningHeaders(
        isCheckedIn?.checkedIn && irdModule
          ? [...uniqueFilteredDiningOptions, { type: IN_ROOM_DINING }]
          : uniqueFilteredDiningOptions,
      );
    }
  }, [queryResultsData]);

  const queryResultEntity = selectedRestaurantData;
  const restaurantId = queryResultEntity?.id;

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
  }, [queryResultEntity?.menu, queryResultEntity?.menuType, router]);

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    setAvailableSlots(false);
    setSelectedTime(dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM));
    setTimeSelectDrawer(false);
    setDetailContent(true);
    setGuestCount(1);
    setSelectedRestaurantData('');
  };

  const closeBooking = () => {
    setIframeComponent(false);
  };

  const closeMenu = () => {
    setMenu(false);
  };

  const handleFindTable = useCallback(async () => {
    const DetailsReservationPayload = {
      date: dayjs(selectedTime).year(currentYear).format('YYYY-MM-DD'),
      exposure: 'No preference',
      hotelId: HOTEL_ID,
      isReservedForGuest: false,
      restaurantId: restaurantId,
      reserveFrom: dayjs(selectedTime, 'HH:mm').add(1, 'hour').format('HH:mm') ?? '',
      reserveUntil: dayjs(selectedTime, 'HH:mm').add(2, 'hour').format('HH:mm'),
      description: '',
      firstName: isCheckedIn?.name,
      guestType: isCheckedIn?.roomNumber ? 'resident' : 'nonresident',
      lastName: '',
      noOfGuests: guestCount,
      roomNo: isCheckedIn?.roomNumber,
      tableNumbers: [],
    };
    try {
      await client.mutate({
        mutation: CREATE_RESTAURANT_RESERVATION,
        context: { clientName: 'host_v3' },
        fetchPolicy: 'network-only',
        variables: DetailsReservationPayload,
      });
      setErrorNotification(false);
      setTimeout(() => {
        closeDrawer();
      }, 4000);
    } catch (err) {
      setErrorNotification(true);
    }
    toggleNotification(true);
  }, [
    selectedTime,
    currentYear,
    restaurantId,
    isCheckedIn?.name,
    isCheckedIn?.roomNumber,
    guestCount,
  ]);

  const restaurantTiming = getTimings(queryResultEntity?.customAttributes);

  const restaurantDetail = () => (
    <div className={styles.listComponent}>
      {!availableSlots && (
        <div className={styles.imageWrapper}>
          {queryResultEntity?.images?.length > 0 ? (
            <StableImage
              className={styles.bannerImage}
              src={`${ASSETS_URL}/${queryResultEntity?.images[0]?.ratio16to9}`}
            />
          ) : (
            <PlaceholderImage />
          )}
          {queryResultEntity?.cta?.status === ACTIVE && (
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
              className={cx(styles.button, {
                [styles.buttonNone]: timeSelectDrawer,
                [styles.withoutImageButton]:
                  queryResultEntity && !queryResultEntity?.images[0]?.ratio16to9,
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
                  {queryResultEntity?.ctaTitle || t('VIEW MENU')}
                </StyledButton>
              </div>
            )}

            {queryResultEntity?.description && (
              <p className={styles.listComponentDataText}>
                {t(`${queryResultEntity?.description}`)}
              </p>
            )}

            <div className={styles.thirdRow}>
              <>
                {queryResultEntity?.contactNumber && (
                  <a href={`tel:${queryResultEntity?.contactNumber}`} className={styles.callRow}>
                    <PhoneIcon className={styles.callIcon} />
                    <span className={styles.icon_contact}>{t('Call')}</span>
                  </a>
                )}
                {queryResultEntity?.email && (
                  <a href={`mailto:${queryResultEntity?.email}`} className={styles.emailRow}>
                    <EmailIcon className={styles.emailIcon} />{' '}
                    <span className={styles.icon_contact}>{t('Email')}</span>
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
            <p className={styles.preferredTitle}>{t('Preferred Date & Time')}</p>
            <DateTimeSelect
              setSelectedTime={setSelectedTime}
              selectedTime={selectedTime}
              handleSave={handleFindTable}
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
        title={errorNotification ? (ERRORMSG as string) : (t('Thank You!') as string)}
        description={
          errorNotification
            ? ('Your booking was not received.' as string)
            : (t(
                'Your booking has been received. Our reservation team will get in touch with you soon',
              ) as string)
        }
        redirect={!errorNotification && availablePaths?.RESTAURANTS_BARS}
        type={errorNotification ? FAILURE : SUCCESS}
      />
    </div>
  );

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Restaurants & Bars') as string}
        </title>
      </Head>
      <Header screenTitle={t('Restaurants & Bars') as string} displayHome />
      {loading ? (
        <Loader />
      ) : (
        <>
          <PageWrapper className={styles.pageWrapper} displayBottomMenu>
            <div>
              {filteredList?.map((queryResultEntity: any) => (
                <ListComponentEntity
                  key={queryResultEntity?.id}
                  queryResultEntity={queryResultEntity}
                  selectedListItem={selectedListItem}
                />
              ))}
            </div>
          </PageWrapper>

          {iframeComponent || menu ? (
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
          ) : (
            <CustomDrawer
              open={restaurantDetailsDrawerStatus}
              onClose={closeDrawer}
              content={restaurantDetail()}
            />
          )}
        </>
      )}
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
