import React, { useCallback, useEffect, useState } from 'react';
import styles from './RestaurantDetails.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { IDiningOrdersProps } from './RestaurantDetail.types';
import { useTranslation } from 'react-i18next';
import TimeIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import { getTimings, restaurantCtaNavigation } from 'utils/functions';
import { ASSETS_URL, HOTEL_ID } from 'core/graphql/endpoints';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import router from 'next/router';
import { availablePaths } from 'utils/availablePaths';
import {
  ACTIVE,
  OK,
  ENQUIRE,
  EMAIL,
  PHONE,
  ERRORMSG,
  FAILURE,
  SUCCESS,
  WEBURL,
  S3,
  RESTAURANTS_AND_BARS,
} from 'utils/constants';
import cx from 'classnames';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useCheckedIn } from 'storage/check-in.storage';
import { CREATE_RESTAURANT_RESERVATION } from 'core/graphql/queries/GET_RESTAURANT_RESERVATION_DETAILS';
import { client } from 'core/graphql/client';
import {
  toggleDetailsDrawer,
  toggleNotification,
  toggleRestaurantDetailsDrawer,
} from 'storage/home.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { useReactiveVar } from '@apollo/client';
import { PhoneEmail } from 'components/shared/PhoneEmail/PhoneEmail';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';

export const RestaurantDetail: React.FC<IDiningOrdersProps> = ({
  selectedRestaurant,
  timeSelectProps,
}) => {
  const { t } = useTranslation(['restaurants']);
  // const orderId = ordersData[ordersData?.length - 1]?.id?.slice(0, 6);
  const [availableSlots, setAvailableSlots] = useState(false);
  const [timeSelectDrawer, setTimeSelectDrawer] = useState(false);
  const [detailContent, setDetailContent] = useState(true);
  const [guestCount, setGuestCount] = useState(1);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM),
  );
  const [errorNotification, setErrorNotification] = useState(false);
  const [iframeComponent, setIframeComponent] = useState(false);
  const [menu, setMenu] = useState(false);
  const [menuLink, setmenuLink] = useState(null);

  const currentYear = new Date().getFullYear();
  const isCheckedIn = useCheckedIn();
  const queryResultEntity = selectedRestaurant ?? '';

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

  return (
    <div
      className={cx(styles.listComponent, {
        [styles.listComponentMargin]: queryResultEntity?.cta?.status === ACTIVE,
      })}
    >
      {!availableSlots && (
        <div className={styles.imageWrapper}>
          {queryResultEntity?.images?.length > 0 && (
            <CustomCarousel imageData={queryResultEntity} />
          )}
        </div>
      )}
      {detailContent && (
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
                  {queryResultEntity?.ctaTitle || t('VIEW MENU')}
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
            <div style={{ position: 'fixed' }}>
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
                className={cx(styles.button, 'globals-actionCtaWrapper', {
                  [styles.buttonNone]: timeSelectDrawer,
                  [styles.withoutImageButton]:
                    queryResultEntity && !queryResultEntity?.images[0]?.ratio16to9,
                })}
              >
                {queryResultEntity?.cta?.ctaTitle || t('BOOK NOW')}
              </StyledButton>
            </div>
          )}
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
        translation={t}
        title={errorNotification ? (ERRORMSG as string) : (t('Thank You!') as string)}
        description={
          errorNotification
            ? (t('Your booking was not received.') as string)
            : (t(
                'Your booking has been received. Our reservation team will get in touch with you soon',
              ) as string)
        }
        redirect={!errorNotification && availablePaths?.RESTAURANTS_BARS}
        type={errorNotification ? FAILURE : SUCCESS}
      />
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
