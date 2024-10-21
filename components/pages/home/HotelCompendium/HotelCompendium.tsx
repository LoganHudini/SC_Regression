import React, { useEffect } from 'react';
import styles from './HotelCompendium.module.scss';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { getHotelCompendium, selectedCompendiumCategory } from 'storage/home.storage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { useTranslation } from 'react-i18next';
import { filterHotelCompendiumCategories } from 'utils/functions';
import cx from 'classnames';

export const HotelCompendiumContainer = (props: any) => {
  const { data } = props;
  const { t } = useTranslation('common');
  const navigate = useLocalizedRouter();

  useEffect(() => {
    if (data) {
      getHotelCompendium(data?.getHotelAmenityDetails);
    }
  }, [data]);

  const amenities = data?.getHotelAmenityDetails?.amenities;
  const categories = filterHotelCompendiumCategories(data);

  const handleClick = (id: any) => {
    selectedCompendiumCategory(categories?.find((category: any) => category?.id === id));
    navigate(availablePaths.HOTEL_COMPENDIUM);
  };

  return (
    <>
      {categories?.length > 0 && (
        <>
          <div className={styles.title}>{t('Things To Do')}</div>
          <div className={styles.container}>
            {categories?.map((category: any, index: number) => (
              <div key={index} className={styles.wrapper} onClick={() => handleClick(category?.id)}>
                <div className={styles.imgWrapper}>
                  <p className={cx(styles.name, 'globals-compendiumTitle')}>{category?.name}</p>
                </div>

                <StableImage
                  className={styles.image}
                  src={`${ASSETS_URL}/${
                    category?.images[0]?.master && category?.images[0]?.master
                  }`}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
