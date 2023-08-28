import React, { useCallback, useEffect, useState } from 'react';
import styles from './DETAIL_PAGE.module.scss';
import { IConfig, IQueryResultEntity } from '../../../../types/UIConfiguration.types';
import { ASSETS_URL, HOTEL_CODE } from 'core/graphql/endpoints';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import ForkKnifeIcon from '@icons/forkKnife.svg';
import cx from 'classnames';
import CuisineIcon from '@icons/cuisine.svg';
import LocationIcon from '@icons/location.svg';
import TimeIcon from '@icons/time.svg';
import PhoneIcon from '@icons/phone.svg';
import EmailIcon from '@icons/email.svg';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import { useRouter } from 'next/router';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { flowPathMap } from 'utils/flowPathMap';
import { downloadFile } from 'utils/downloadFile';
import { useTranslation } from 'react-i18next';
import { restaurantListStorage, tableReservationStorage } from 'storage/table-reservation.storage';
import { useCheckedIn } from 'storage/check-in.storage';
import { availablePaths } from 'utils/availablePaths';
import { reservationFlow, offers, DUBAI_WATERFRONT, BARCELONA } from 'utils/constants';
import { CustomDrawer } from 'components/pages/table-reservations/CustomDrawer/CustomDrawer';
import { diningInformationStorage } from 'storage/dining.storage';
import { TableNumberDrawer } from 'components/shared/TableNumberDrawer/TableNumberDrawer';
import { stringify } from 'querystring';

interface IDetailPageProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const DETAIL_PAGE: React.FC<IDetailPageProps> = ({ config }) => {
  const { t } = useTranslation(['ui-builder']);
  const checkinData = useCheckedIn();
  let queryResults: IQueryResultEntity[] = [];
  let data = {};

  const [additionalInfoOpened, setAdditionalInfoOpened] = useState(false);
  const [additionalTimeOpened, setAdditionalTimeOpened] = useState(false);
  const [tableNumberDrawer, setTableNumberDrawer] = useState(false);

  const toggleAdditionalInfoOpened = useCallback(() => {
    setAdditionalInfoOpened((oldState) => !oldState);
  }, []);

  const toggleAdditionalTimeOpened = useCallback(() => {
    setAdditionalTimeOpened((oldState) => !oldState);
  }, []);

  if (config?.hotelModule?.toLowerCase() === offers) {
    data = config?.moduleQueryResult ? { 0: config?.moduleQueryResult } : {};
    queryResults = data[0 as keyof typeof data];
  } else {
    queryResults = config.moduleQueryResult
      ? config.moduleQueryResult[Object.keys(config.moduleQueryResult)[1]]
      : [];
  }

  const queryResultEntity = queryResults?.find(
    (el) => el.id === config.hotelModuleId,
  ) as IQueryResultEntity;

  const queryResultsData = queryResults.filter(
    (item) =>
      item?.cta?.status === 'Active' &&
      item?.cta?.redirectOption === reservationFlow &&
      item.isActive,
  );
  restaurantListStorage(queryResultsData.map((item) => ({ id: item?.id, name: item?.name })));

  const router = useRouter();
  const navigate = useLocalizedRouter();

  const onCtaClick = useCallback(() => {
    if (checkinData?.checkedIn) {
      if (queryResultEntity?.cta?.redirectOption === 'External URL') {
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
        navigate(flowPathMap.RESTAURANT_BOOKING);
      }
    } else {
      navigate(availablePaths.CHECK_IN);
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
    if (queryResultEntity?.menuType === 'WEB_URL}') {
      router.push(queryResultEntity?.menu.split('=')[1].split(',')[0]);
    }

    if (queryResultEntity?.menuType === 'S3') {
      downloadFile(
        `${ASSETS_URL}/${queryResultEntity?.menu.split('=')[1].split(',')[0]}`,
        'menu.pdf',
      );
    }
  }, [queryResultEntity?.menu, queryResultEntity?.menuType, router]);

  const toggleConfirmDrawerOpened = useCallback(() => {
    setTableNumberDrawer((oldState) => !oldState);
  }, []);

  const handleViewMenu = () => {
    tableReservationStorage({
      restaurantName: queryResultEntity?.name,
      id: queryResultEntity?.id,
    });
    diningInformationStorage({
      selectedMenu: '',
      menuName: '',
      selectedCategory: '',
      categoryName: '',
    });

    if (typeof window !== 'undefined') {
      const item = localStorage.getItem('guestDetails');
      if (item === null) {
        localStorage.setItem(
          'guestDetails',
          JSON.stringify({
            name: '',
            roomNumber: '',
          }) ?? '',
        );
      }
    }
    toggleConfirmDrawerOpened();
  };

  return (
    <div className={styles.listComponent}>
      <StableImage
        className={styles.bannerImage}
        src={
          queryResultEntity?.images && queryResultEntity?.images[0]
            ? `${ASSETS_URL}/${queryResultEntity?.images[0]?.master}`
            : undefined
        }
      />
      <div className={styles.listComponentData}>
        {queryResultEntity?.name && (
          <h2 className={styles.listComponentTitle}>{t(`${queryResultEntity?.name}`)}</h2>
        )}

        {queryResultEntity?.description && (
          <p className={styles.listComponentDataText}>{t(`${queryResultEntity?.description}`)}</p>
        )}

        {queryResultEntity?.additionalInformation && (
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
        )}
      </div>

      <div className={styles.firstRow}>
        {queryResultEntity?.primaryCuisine && (
          <div className={styles.cuisineRow}>
            <ForkKnifeIcon className={styles.cuisineIcon} />
            <span className={styles.icon_text}>{queryResultEntity?.primaryCuisine}</span>
          </div>
        )}
        {queryResultEntity?.location && (
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
        )}
      </div>

      {queryResultEntity?.hours && queryResultEntity?.hours.length > 0 && (
        <div className={styles.timeRow}>
          <TimeIcon className={styles.timeIcon} />
          <div className={styles.timeColumn}>
            <p>{`${queryResultEntity?.hours[0].day.toLowerCase()} : ${
              queryResultEntity?.hours[0].open
            } - ${queryResultEntity?.hours[0].close}`}</p>

            <div
              className={cx(styles.additionalTimeWrapper, {
                [styles.additionalTimeWrapperOpened]: additionalTimeOpened,
              })}
            >
              {queryResultEntity?.hours.slice(1).map((hour) => (
                <p
                  className={styles.additionalTimeEntity}
                  key={hour.day}
                >{`${hour.day.toLowerCase()} : ${hour.open} - ${hour.close}`}</p>
              ))}
            </div>
          </div>

          {queryResultEntity?.hours.length > 1 && (
            <button onClick={toggleAdditionalTimeOpened} className={styles.timeShowMoreButton}>
              <ArrowBottomIcon
                className={cx(styles.timeShowMoreIcon, {
                  [styles.timeShowMoreIconOpened]: additionalTimeOpened,
                })}
              />
            </button>
          )}
        </div>
      )}

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

        {queryResultEntity?.menuStatus === 'Active' && (
          <StyledButton onClick={onSeeMenuClick} className={styles.thirdRowBtn}>
            {queryResultEntity?.ctaTitle || t('See menus')}
          </StyledButton>
        )}
      </div>

      <StyledButton
        variant={queryResultEntity?.cta?.ctaTitle ? 'outlined' : 'contained'}
        onClick={handleViewMenu}
        className={styles.viewMenuOrder}
      >
        {t('view menu & order')}
      </StyledButton>

      {queryResultEntity?.cta?.status === 'Active' && (
        <StyledButton onClick={onCtaClick} className={styles.bookTableBtn}>
          {queryResultEntity?.cta?.ctaTitle}
        </StyledButton>
      )}

      {queryResultEntity?.CTA?.type && (
        <StyledButton className={styles.bookTableBtn} variant='contained'>
          <>
            {queryResultEntity?.CTA?.type === 'OK' && (
              <div onClick={() => router.back()}>{queryResultEntity?.CTA?.type}</div>
            )}
            {(queryResultEntity?.CTA?.type === 'ENQUIRE' &&
              queryResultEntity?.CTA?.contact === 'email' && (
                <a
                  href={`mailto:${queryResultEntity?.CTA?.emailId}`}
                  className={styles.emailRowOffers}
                >
                  <span>{queryResultEntity?.CTA?.type}</span>
                </a>
              )) ||
              (queryResultEntity?.CTA?.contact === 'phone' && (
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
  );
};
