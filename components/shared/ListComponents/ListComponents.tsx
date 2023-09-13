import { StableImage } from '../StableImage/StableImage';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import styles from './ListComponents.module.scss';
import { ASSETS_URL, CURRENCY } from 'core/graphql/endpoints';

export const ListComponentEntity: React.FC<any> = ({ queryResultEntity, selectedListItem }) => {
  const { t } = useTranslation(['common']);

  const onCtaClick = useCallback(() => {
    selectedListItem(queryResultEntity);
  }, [queryResultEntity, selectedListItem]);

  const time =
    queryResultEntity?.hours &&
    `${queryResultEntity?.hours[0]?.day.slice(0, 3).toLowerCase()}-${
      queryResultEntity?.hours[0]?.open
    }-${queryResultEntity?.hours[0]?.close}...`;

  return (
    <div className={styles.listComponent} onClick={onCtaClick}>
      <StableImage
        className={styles.bannerImage}
        src={`${ASSETS_URL}/${queryResultEntity?.images[0]?.master}`}
      />
      <div className={styles.contentWrapper}>
        <div className={styles.imageContent}>
          {queryResultEntity?.name && (
            <h2 className={styles.listComponentTitle}>{t(`${queryResultEntity?.name}`)}</h2>
          )}
          {queryResultEntity?.duration && queryResultEntity?.duration[0]?.price && (
            <p className={styles.listDurationPrice}>
              <span className={styles.currency}>{CURRENCY}</span>{' '}
              {queryResultEntity?.duration[0]?.price}
              {'   '}|{'   '}
              {queryResultEntity?.duration[0]?.duration} Min
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
          {queryResultEntity?.hours && (
            <div className={styles.cuisineRow}>
              <ClockIcon className={styles.cuisineIcon} />
              <span>{time}</span>
            </div>
          )}
          <span className={styles.readMoreButton}>
            {t('Read more')}
            {/* <ArrowButton /> */}
          </span>
        </div>
      </div>
    </div>
  );
};
