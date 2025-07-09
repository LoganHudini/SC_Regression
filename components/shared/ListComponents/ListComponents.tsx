import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import styles from './ListComponents.module.scss';
import { BRAND_CODE } from 'core/graphql/endpoints';
import dayjs from 'dayjs';
import { convertTo12HourFormatSmallCase, getTimings } from 'utils/functions';
import { CustomReadMore } from '../CustomReadMore/CustomReadMore';
import { useCurrency } from 'utils/hooks/useCurrency';
import cx from 'classnames';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useRouter } from 'next/router';
import { availablePaths } from 'utils/availablePaths';
import CustomCarousel from '../CustomCarousel/CustomCarousel';

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
  const currency = useCurrency();
  const config = useConfig();
  const router = useRouter();
  const offersActive = router?.asPath?.includes(availablePaths?.OFFERS);

  const onCtaClick = useCallback(() => {
    selectedListItem(queryResultEntity);
  }, [queryResultEntity, selectedListItem]);

  const hasScheduleTime =
    !!queryResultEntity?.schedule?.startTime || !!queryResultEntity?.schedule?.endTime;

  const time = hasScheduleTime
    ? `${convertTo12HourFormatSmallCase(
        queryResultEntity?.schedule?.startTime || '',
      )} to ${convertTo12HourFormatSmallCase(queryResultEntity?.schedule?.endTime || '')}`
    : getTimings(queryResultEntity?.customAttributes) || '';

  return (
    <div className={styles.listComponent} onClick={onCtaClick}>
      {(config?.hideImagePlaceholder ? queryResultEntity?.images?.length > 0 : true) && (
        <CustomCarousel imageData={queryResultEntity} />
      )}
      <div
        className={cx(
          styles.contentWrapper,
          'globals-contentWrapper',
          'globals-cardWrapperRestaurantsAndBars',
        )}
      >
        <div className={cx(styles.imageContent, 'globals-imageContent')}>
          {queryResultEntity?.name && (
            <h2 className={cx(styles.listComponentTitle, 'globals-text-align')}>
              {t(`${queryResultEntity?.name}`)}
            </h2>
          )}
          {(queryResultEntity?.duration?.[0]?.price || queryResultEntity?.price > 0) && (
            <p className={cx(styles.listDurationPrice, 'globals-text-align')}>
              <span className={styles.currency}>
                {queryResultEntity?.duration?.length > 1 && <>{t('Starts from')} </>}
                {currency}{' '}
              </span>
              {Number(
                queryResultEntity?.duration?.[0]?.price ?? queryResultEntity?.price,
              ).toLocaleString('en-US')}
              {queryResultEntity?.duration?.[0]?.duration && (
                <>
                  {' | '}
                  {queryResultEntity.duration[0].duration} {t('Min')}
                </>
              )}
            </p>
          )}

          {queryResultEntity?.duration && offersActive && (
            <p className={cx(styles.listDurationOffer, 'globals-listDurationOffer')}>
              {queryResultEntity?.duration?.alwaysActive
                ? t('Everyday')
                : (() => {
                    const startDate = dayjs(queryResultEntity?.duration?.startDate, 'DD-MM-YYYY');
                    const endDate = dayjs(queryResultEntity?.duration?.endDate, 'DD-MM-YYYY');
                    const displayStartDate =
                      startDate?.year() === endDate?.year()
                        ? startDate.format('MMMM D')
                        : startDate.format('MMMM D, YYYY');

                    const displayEndDate = endDate.format('MMMM D, YYYY');

                    return `${displayStartDate} ${t('until')} ${displayEndDate}`;
                  })()}
            </p>
          )}
          {queryResultEntity?.description && (
            <p className={cx(styles.listDescription, 'globals-text-align')}>
              {queryResultEntity?.description}
            </p>
          )}
          {queryResultEntity?.primaryCuisine && (
            <div className={styles.cuisineRow}>
              <DishIcon />
              <span>{queryResultEntity?.primaryCuisine.toLowerCase()}</span>
            </div>
          )}
          {time && (
            <div className={styles.cuisineRowTime}>
              <ClockIcon />
              <p>{time?.value || time || ''}</p>
            </div>
          )}
          <CustomReadMore
            text={t(BRAND_CODE === 'fairmont' ? 'Discover' : 'View More') as string}
          />
        </div>
      </div>
    </div>
  );
};
