import { useRouter } from 'next/router';
import { StableImage } from '../StableImage/StableImage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useCheckedIn } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { getRedirectLink } from 'utils/getRedirectLink';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import styles from './ListComponents.module.scss';
import { ASSETS_URL } from 'core/graphql/endpoints';

export const ListComponentEntity: React.FC<any> = ({
  queryResultEntity,
  listItems,
  paths,
  selectedRestaurant,
}) => {
  const router = useRouter();
  const navigate = useLocalizedRouter();
  const checkinData = useCheckedIn();
  const { t } = useTranslation(['ui-builder']);
  const [tableNumberDrawer, setTableNumberDrawer] = useState(false);

  const toggleConfirmDrawerOpened = useCallback(() => {
    setTableNumberDrawer((oldState) => !oldState);
  }, [tableNumberDrawer]);

  const linkId = listItems?.find((el: any) => el.hotelModuleId === queryResultEntity.id)?.linkId;
  const redirectUrl = getRedirectLink(paths, linkId);

  const onCtaClick = useCallback(() => {
    selectedRestaurant(queryResultEntity.id);
  }, [navigate, redirectUrl]);

  const time = `${queryResultEntity.hours[0]?.day.slice(0, 3).toLowerCase()}-${
    queryResultEntity.hours[0]?.open
  }-${queryResultEntity.hours[0]?.close}...`;

  return (
    <div className={styles.listComponent}>
      <StableImage
        className={styles.bannerImage}
        src={
          queryResultEntity?.images[0]
            ? `${ASSETS_URL}/${queryResultEntity?.images[0].ratio16to9}`
            : undefined
        }
        onClick={onCtaClick}
      />
      <div className={styles.contentWrapper}>
        <div className={styles.imageContent} onClick={onCtaClick}>
          {queryResultEntity?.name && (
            <h2 className={styles.listComponentTitle} onClick={onCtaClick}>
              {t(`${queryResultEntity?.name}`)}
            </h2>
          )}
          {queryResultEntity?.primaryCuisine && (
            <div className={styles.cuisineRow}>
              <DishIcon className={styles.cuisineIcon} />
              <span>{queryResultEntity.primaryCuisine.toLowerCase()}</span>
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
