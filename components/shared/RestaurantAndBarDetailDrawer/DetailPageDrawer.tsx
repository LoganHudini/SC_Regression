import React, { useCallback, useState } from 'react';
import styles from './DetailPageDrawer.module.scss';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import ForkKnifeIcon from '@icons/forkKnife.svg';
import cx from 'classnames';
import LocationIcon from '@icons/location.svg';
import TimeIcon from '@icons/clockIcon.svg';
import PhoneIcon from '@icons/phone.svg';
import EmailIcon from '@icons/email.svg';
import DishIcon from '@icons/dishIcon.svg';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import { useRouter } from 'next/router';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { flowPathMap } from 'utils/flowPathMap';
import { downloadFile } from 'utils/downloadFile';
import { useTranslation } from 'react-i18next';
import {
  RestaurantDetailDrawerStatus,
  restaurantListStorage,
  tableReservationStorage,
} from 'storage/table-reservation.storage';
import { useCheckedIn } from 'storage/check-in.storage';
import { availablePaths } from 'utils/availablePaths';
import { RESTAURANT_BOOKIN_FLOW, OFFERS, S3, WEBURL, EXTERNALURL, ACTIVE, OK, ENQUIRE, EMAIL, PHONE } from 'utils/constants';
import { diningInformationStorage } from 'storage/dining.storage';
import { TableNumberDrawer } from 'components/pages/dining/TableNumberDrawer/TableNumberDrawer';
import { Drawer } from '@mui/material';
import { handleTouchEnd, handleTouchStart } from 'utils/hooks/useDrawerSwipe';
import { IQueryResultEntity } from 'types/UIConfiguration.types';
import { useReactiveVar } from '@apollo/client';
import { PlusMinusInput } from '../PlusMinusInput/PlusMinusInput';
import DateTimeSelect from '../DateTimeSelect/DateTimeSelect';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';

interface IDetailPageProps {
  data?: any;
}

export const DetailPage: React.FC<IDetailPageProps> = ({ data }) => {
  const { t } = useTranslation(['ui-builder']);
  const checkinData = useCheckedIn();
  const [startY, setStartY] = useState(0);
  const [guestCount, setGuestCount] = useState(1);
  const [availableSlots, setAvailableSlots] = useState(false);
  const [timeSelectDrawer, setTimeSelectDrawer] = useState(false);
  const [detailContent, setDetailContent] = useState(true);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM),
  );

  const [additionalInfoOpened, setAdditionalInfoOpened] = useState(false);
  const [additionalTimeOpened, setAdditionalTimeOpened] = useState(false);
  const [tableNumberDrawer, setTableNumberDrawer] = useState(false);
  const [tableDrawerState, setTableDrawerState] = useState(false);
  const restaurantDetailsDrawerStatus = useReactiveVar(RestaurantDetailDrawerStatus);

  const toggleAdditionalInfoOpened = useCallback(() => {
    setAdditionalInfoOpened((oldState) => !oldState);
  }, []);

  const toggleAdditionalTimeOpened = useCallback(() => {
    setAdditionalTimeOpened((oldState) => !oldState);
  }, []);

  const queryResultEntity = data ? data[0] : '';

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

  const router = useRouter();
  const navigate = useLocalizedRouter();

  const onCtaClick = useCallback(() => {
    if (queryResultEntity?.cta?.redirectOption === EXTERNALURL) {
      router.push(queryResultEntity?.cta?.redirectUrl);
    }
    if (queryResultEntity?.cta?.redirectOption === 'Restaurant Booking Flow') {
      tableReservationStorage({
        restaurantName: queryResultEntity?.name,
        id: queryResultEntity?.id,
        venueId:
          (queryResultEntity?.customAttributes &&
            queryResultEntity?.customAttributes[0]?.value) ??
          '',
      });
      localStorage.setItem('restaurantId', JSON.stringify(queryResultEntity?.id) ?? '');
      setDetailContent(false);
      setTimeSelectDrawer(true);
    }
  }, [
    checkinData?.checkedIn,
    navigate,
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
    RestaurantDetailDrawerStatus(false);
    setTableDrawerState(false);
    setAdditionalTimeOpened(false);
    setAvailableSlots(false);
    setTimeSelectDrawer(false);
  };

  const optimizedHours = queryResultEntity && optimizeRestaurantHours(queryResultEntity.hours);

  const handleSave = () => {
    // create table reservation
    setTimeSelectDrawer(false);
  };

  return (
    <Drawer
      variant='temporary'
      anchor='bottom'
      open={restaurantDetailsDrawerStatus}
      onClose={closeDrawer}
      PaperProps={{
        elevation: 0,
        style: {
          maxWidth: '768px',
          maxHeight: 'var(--primary-drawer-height)',
          margin: 'auto',
          borderTopLeftRadius: 'var(--primary-drawer-top-left-border-radius)',
          borderTopRightRadius: 'var(--primary-drawer-top-right-border-radius)',
        },
      }}
      slotProps={{
        backdrop: {
          style: {
            opacity: restaurantDetailsDrawerStatus
              ? 'var(--primary-drawer-background-opacity)'
              : '0',
            transition: 'opacity 0.5s ease-in-out',
            backdropFilter: 'blur(2px)',
          },
        },
      }}
      onTouchStart={(e) => handleTouchStart(e, setStartY)}
      onTouchEnd={(e) => handleTouchEnd(e, startY, setStartY, closeDrawer)}
    >
      <div className={styles.listComponent}>
        {!availableSlots && <div className={styles.imageWrapper}>
          <StableImage
            className={styles.bannerImage}
            src={
              queryResultEntity?.images && queryResultEntity?.images[0]
                ? `${ASSETS_URL}/${queryResultEntity?.images[0]?.master}`
                : undefined
            }
          />

          {queryResultEntity?.cta?.status === ACTIVE && (
            <StyledButton variant='contained' onClick={onCtaClick} className={cx(styles.button, {
              [styles.buttonNone]: tableDrawerState,
            })}>
              {queryResultEntity?.cta?.ctaTitle || t('BOOK A TABLE')}
            </StyledButton>
          )}
        </div>}

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
                        <button
                          onClick={toggleAdditionalTimeOpened}
                          className={styles.timeShowMoreButton}
                        >
                          <ArrowBottomIcon
                            className={cx(styles.timeShowMoreIcon, {
                              [styles.timeShowMoreIconOpened]: additionalTimeOpened,
                            })}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {queryResultEntity?.menuStatus === ACTIVE && (
                    <StyledButton variant='outlined' onClick={onSeeMenuClick} className={styles.buttonView}>
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

        {timeSelectDrawer && <>
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
          <DateTimeSelect
            setSelectedTime={setSelectedTime}
            selectedTime={selectedTime}
            handleSave={handleSave}
            showSchedules={undefined} />
        </>
        }
        {availableSlots && <>

        </>
        }

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
        <TableNumberDrawer
          toggleConfirmDrawerOpened={toggleConfirmDrawerOpened}
          tableNumberDrawer={tableNumberDrawer}
          restId={queryResultEntity?.id}
        />
      </div>
    </Drawer>
  );
};
