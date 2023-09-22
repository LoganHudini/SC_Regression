import { StableImage } from '../StableImage/StableImage';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import ArrowButton from '@icons/readMoreArrow.svg';
import styles from './ListComponents.module.scss';
import { ASSETS_URL, CURRENCY } from 'core/graphql/endpoints';
import { OFFERSDURATION } from 'utils/constants';
import dayjs from 'dayjs';
import { buttonArrow, restaurantTimings } from 'utils/functions';

interface ListComponentEntityProps {
  queryResultEntity: any;
  selectedListItem: any;
  module?: any;
}

export const ListComponentEntity: React.FC<ListComponentEntityProps> = ({
  queryResultEntity,
  selectedListItem,
}) => {
  const { t } = useTranslation(['common']);
  const buttonArrowState = buttonArrow;

  const onCtaClick = useCallback(() => {
    selectedListItem(queryResultEntity);
  }, [queryResultEntity, selectedListItem]);

  const time = restaurantTimings(queryResultEntity?.customAttributes);

  return (
    <div className={styles.listComponent} onClick={onCtaClick}>
      <StableImage
        className={styles.bannerImage}
        src={`${ASSETS_URL}/${queryResultEntity?.images[0]?.ratio16to9}`}
      />
      <div className={styles.contentWrapper}>
        <div className={styles.imageContent}>
          {queryResultEntity?.name && (
            <h2 className={styles.listComponentTitle}>{t(`${queryResultEntity?.name}`)}</h2>
          )}
          {queryResultEntity?.duration && queryResultEntity?.duration[0]?.price && (
            <p className={styles.listDurationPrice}>
              <span className={styles.currency}>{CURRENCY} </span>
              {queryResultEntity?.duration[0]?.price}
              {'   '}|{'   '}
              {queryResultEntity?.duration[0]?.duration} Min
            </p>
          )}
          {queryResultEntity?.duration &&
            queryResultEntity?.duration.__typename === OFFERSDURATION && (
              <p className={styles.listDurationOffer}>
                {queryResultEntity?.duration?.alwaysActive
                  ? t('Everyday')
                  : (() => {
                      const startDate = dayjs(queryResultEntity?.duration?.startDate, 'DD-MM-YYYY');
                      const endDate = dayjs(queryResultEntity?.duration?.endDate, 'DD-MM-YYYY');
                      const displayStartDate = startDate?.format('MMM D, YYYY');
                      const displayEndDate =
                        startDate?.year() === endDate?.year()
                          ? endDate.format('MMM D')
                          : endDate.format('MMM D, YYYY');

                      return `${displayStartDate} until ${displayEndDate}`;
                    })()}
              </p>
            )}
          {queryResultEntity?.description && (
            <p className={styles.listDescription}>{queryResultEntity?.description}</p>
          )}
          {queryResultEntity?.primaryCuisine && (
            <div className={styles.cuisineRow}>
              <DishIcon className={styles.cuisineIcon} />
              <span>{queryResultEntity?.primaryCuisine.toLowerCase()}</span>
            </div>
          )}{' '}
          {time && (
            <div className={styles.cuisineRowTime}>
              <ClockIcon className={styles.cuisineIcon} />
              <p>{time?.value}</p>
            </div>
          )}
          <span className={styles.readMoreButton}>
            {t('Read more')}
            {buttonArrowState && <ArrowButton />}
          </span>
        </div>
      </div>
    </div>
  );
};
