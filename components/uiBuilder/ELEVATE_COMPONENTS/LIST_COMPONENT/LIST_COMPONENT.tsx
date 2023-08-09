import React, { useCallback, useState, useEffect } from 'react';
import { ASSETS_URL, BRANCH_CODE, HOTEL_CODE } from '../../../../core/graphql/endpoints';
import { IConfig, IQueryResultEntity } from '../../../../types/UIConfiguration.types';
import styles from './LIST_COMPONENT.module.scss';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { useTranslation } from 'react-i18next';
import CuisineIcon from '@icons/cuisine.svg';
import LocationIcon from '@icons/location.svg';
import ForkKnifeIcon from '@icons/forkKnife.svg';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useRouter } from 'next/router';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useCheckedIn } from 'storage/check-in.storage';
import { availablePaths } from 'utils/availablePaths';
import { restaurantListStorage, tableReservationStorage } from 'storage/table-reservation.storage';
import { flowPathMap } from 'utils/flowPathMap';
import { DUBAI_WATERFRONT, offers, reservationFlow } from 'utils/constants';
import dayjs from 'dayjs';
import { diningInformationStorage } from 'storage/dining.storage';
import { TableNumberDrawer } from 'components/shared/TableNumberDrawer/TableNumberDrawer';

interface IListComponentProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

interface IListComponentEntityProps {
  queryResultEntity: IQueryResultEntity;
  paths: {
    path: string;
    id: string;
  }[];
  listItems?: {
    hotelModuleId: string;
    linkId: string;
  }[];
}

const ListComponentEntity: React.FC<IListComponentEntityProps> = ({
  queryResultEntity,
  listItems,
  paths,
}) => {
  const router = useRouter();
  const navigate = useLocalizedRouter();
  const checkinData = useCheckedIn();
  const { t } = useTranslation(['ui-builder']);
  const [tableNumberDrawer, setTableNumberDrawer] = useState(false);

  const toggleConfirmDrawerOpened = useCallback(() => {
    setTableNumberDrawer((oldState) => !oldState);
  }, [tableNumberDrawer]);

  const linkId = listItems?.find((el) => el.hotelModuleId === queryResultEntity.id)?.linkId;
  const redirectUrl = getRedirectLink(paths, linkId);

  const onCtaClick = useCallback(() => {
    if (redirectUrl) {
      navigate(`/${redirectUrl}`);
    }
  }, [navigate, redirectUrl]);

  const onReservationClick = useCallback(() => {
    if (HOTEL_CODE === 'radisson') {
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
        navigate(flowPathMap?.RESTAURANT_BOOKING);
      }
    } else {
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
          navigate(flowPathMap?.RESTAURANT_BOOKING);
        }
      } else {
        navigate(availablePaths.CHECK_IN);
      }
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

  const onViewMenu = () => {
    restaurantListStorage([{ id: queryResultEntity?.id, name: queryResultEntity?.name }]);
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
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem('tableNumber');
      if (item === null) {
        localStorage.setItem('tableNumber', JSON.stringify(''));
      }
    }
    toggleConfirmDrawerOpened();
  };

  return (
    <div className={styles.listComponent}>
      <StableImage
        className={styles.bannerImage}
        src={
          queryResultEntity.images[0]
            ? `${ASSETS_URL}/${queryResultEntity.images[0].ratio16to9}`
            : undefined
        }
        onClick={onCtaClick}
      />
      <div className={styles.listComponentData}>
        {queryResultEntity.name && (
          <h2 className={styles.listComponentTitle} onClick={onCtaClick}>
            {t(`${queryResultEntity?.name}`)}
          </h2>
        )}

        {queryResultEntity?.description && (
          <p className={styles.listComponentDescription} onClick={onCtaClick}>
            {t(`${queryResultEntity?.description}`)}
          </p>
        )}

        {redirectUrl && (
          <p className={styles.listViewDetails} onClick={onCtaClick}>
            {' '}
            {t('view details')}
          </p>
        )}

        {!router?.asPath?.includes(availablePaths.OFFERS) && (
          <div className={styles.restaurantRow}>
            <CuisineIcon className={styles.restaurantIcon} viewBox='0 0 24 15.47' />
            <span>{t(`${queryResultEntity?.type}`)}</span>
          </div>
        )}
        {queryResultEntity.primaryCuisine && (
          <div className={styles.cuisineRow}>
            <ForkKnifeIcon className={styles.cuisineIcon} viewBox='0 0 24 15.47' />
            <span>{queryResultEntity.primaryCuisine.toLowerCase()}</span>
          </div>
        )}
        {queryResultEntity.location && (
          <div className={styles.locationRow}>
            <LocationIcon className={styles.locationIcon} viewBox='0 0 15.166 20.148' />
            <span>{queryResultEntity.location.addressLine1.toLowerCase()}</span>
          </div>
        )}

        <div className={styles.buttonsWrapper}>
          {redirectUrl && (
            <StyledButton
              className={styles.listComponentBtn}
              variant='outlined'
              onClick={onCtaClick}
            >
              {t('SEE MORE DETAILS')}
            </StyledButton>
          )}

          {BRANCH_CODE !== DUBAI_WATERFRONT && (
            <StyledButton
              className={styles.viewMenuBtn}
              variant={queryResultEntity?.cta?.ctaTitle ? 'outlined' : 'contained'}
              onClick={onViewMenu}
            >
              {t('view menu & order')}
            </StyledButton>
          )}

          {queryResultEntity?.cta?.ctaTitle && (
            <StyledButton
              className={styles.listComponentBookingBtn}
              variant='contained'
              onClick={onReservationClick}
            >
              {queryResultEntity?.cta?.ctaTitle}
            </StyledButton>
          )}

          {queryResultEntity?.CTA?.type && (
            <StyledButton className={styles.listComponentBookingBtn} variant='contained'>
              <>
                {queryResultEntity?.CTA?.type === 'OK' && (
                  <div onClick={() => router.back()}>{queryResultEntity?.CTA?.type}</div>
                )}
                {(queryResultEntity?.CTA?.type === 'ENQUIRE' &&
                  queryResultEntity?.CTA?.contact === 'email' && (
                    <a
                      href={`mailto:${queryResultEntity?.CTA?.emailId}`}
                      className={styles.emailRow}
                    >
                      <span>{queryResultEntity?.CTA?.type}</span>
                    </a>
                  )) ||
                  (queryResultEntity?.CTA?.contact === 'phone' && (
                    <a
                      href={`tel:${queryResultEntity?.CTA?.phoneNumber}`}
                      className={styles.callRow}
                    >
                      {queryResultEntity?.CTA?.type}
                    </a>
                  ))}
              </>
            </StyledButton>
          )}
        </div>
      </div>
      <TableNumberDrawer
        toggleConfirmDrawerOpened={toggleConfirmDrawerOpened}
        tableNumberDrawer={tableNumberDrawer}
        restId={queryResultEntity?.id}
      />
    </div>
  );
};

export const LIST_COMPONENT: React.FC<IListComponentProps> = ({ config, paths }) => {
  const { t } = useTranslation(['ui-builder']);
  let queryResults: IQueryResultEntity[] = [];
  let data = {};

  if (config?.hotelModule?.toLowerCase() === offers) {
    data = config?.moduleQueryResult ? { 0: config?.moduleQueryResult } : {};
    queryResults = data[0 as keyof typeof data];
  } else {
    queryResults = config.moduleQueryResult
      ? config.moduleQueryResult[Object.keys(config.moduleQueryResult)[1]]
      : [];
  }

  const queryResultsData = queryResults?.filter(
    (item) =>
      item?.cta?.status === 'Active' &&
      item?.cta?.redirectOption === reservationFlow &&
      item?.isActive,
  );
  restaurantListStorage(queryResultsData?.map((item) => ({ id: item?.id, name: item?.name })));

  const onBackToTop = () => {
    window.scrollTo(0, 0);
  };
  const currentDate = dayjs();

  return (
    <div className={styles.wrapper}>
      {queryResults
        ?.filter(
          (item) =>
            item?.isActive &&
            (item?.duration
              ? item?.duration?.alwaysActive ||
                dayjs(item?.duration?.endDate, 'DD-MM-YYYY').isAfter(currentDate) ||
                dayjs(item?.duration?.endDate, 'DD-MM-YYYY').isSame(currentDate)
              : true),
        )
        .map((queryResultEntity) => (
          <ListComponentEntity
            key={queryResultEntity.id}
            queryResultEntity={queryResultEntity}
            paths={paths}
            listItems={config.listItems}
          />
        ))}

      {queryResults?.length > 4 && (
        <StyledButton className={styles.backToTop} variant='outlined' onClick={onBackToTop}>
          {t('back to top')}
        </StyledButton>
      )}
    </div>
  );
};
