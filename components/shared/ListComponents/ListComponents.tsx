import { StableImage } from '../StableImage/StableImage';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import styles from './ListComponents.module.scss';
import { ASSETS_URL, BRAND_CODE } from 'core/graphql/endpoints';
import { OFFERSDURATION } from 'utils/constants';
import dayjs from 'dayjs';
import { getTimings } from 'utils/functions';
import { CustomReadMore } from '../CustomReadMore/CustomReadMore';
import { useCurrency } from 'utils/hooks/useCurrency';
import cx from 'classnames';
import { useConfig } from 'utils/hooks/useConfiguration';

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

  const onCtaClick = useCallback(() => {
    selectedListItem(queryResultEntity);
  }, [queryResultEntity, selectedListItem]);

  const time = getTimings(queryResultEntity?.customAttributes);

  return (
    <div className={styles.listComponent} onClick={onCtaClick}>
      {(config?.hideImagePlaceholder ? queryResultEntity?.images?.length > 0 : true) && (
        <StableImage
          className={styles.bannerImage}
          src={`${ASSETS_URL}/${queryResultEntity?.images[0]?.ratio16to9}`}
        />
      )}
      <div className={cx(styles.contentWrapper, 'globals-contentWrapper')}>
        <div className={cx(styles.imageContent, 'globals-imageContent')}>
          {queryResultEntity?.name && (
            <h2 className={cx(styles.listComponentTitle, 'globals-text-align')}>
              {t(`${queryResultEntity?.name}`)}
            </h2>
          )}
          {queryResultEntity?.duration && queryResultEntity?.duration[0]?.price && (
            <p className={cx(styles.listDurationPrice, 'globals-text-align')}>
              <span className={styles.currency}>
                {queryResultEntity?.duration?.length > 1 && (
                  <>
                    {t('Starts from')}
                    {'  '}
                  </>
                )}
                {currency}
                {'  '}
              </span>
              {Number(queryResultEntity?.duration[0]?.price)?.toLocaleString('en-US')}
              {'   '}|{'   '}
              {queryResultEntity?.duration[0]?.duration} {t('Min')}
            </p>
          )}
          {queryResultEntity?.duration &&
            queryResultEntity?.duration.__typename === OFFERSDURATION && (
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
              <p>{time?.value}</p>
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
