import React, { useEffect } from 'react';
import styles from './HotelCompendium.module.scss';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { getHotelCompendium, selectedCompendiumCategory } from 'storage/home.storage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { useTranslation } from 'react-i18next';
import { CarouselLoader } from 'components/shared/Loaders/Loaders';

export const HotelCompendiumContainer = (props: any) => {
  const { data, loading } = props;
  const { t } = useTranslation('common');
  const navigate = useLocalizedRouter();

  useEffect(() => {
    if (data) {
      getHotelCompendium(data?.getHotelAmenityDetails);
    }
  }, [data]);

  const amenities = data?.getHotelAmenityDetails?.amenities;
  const categories = data?.getHotelAmenityDetails?.categories;

  const handleClick = (id: any) => {
    selectedCompendiumCategory(categories?.find((category: any) => category?.id === id));
    navigate(availablePaths.HOTEL_COMPENDIUM);
  };

  const hotelCompendiumAmenities = categories?.map((category: any) =>
    amenities?.find(
      (amenity: any) =>
        category?.id === amenity?.categoryIds[0] &&
        amenity?.images?.length > 0 &&
        amenity?.isActive,
    ),
  );

  return (
    <>
      <div className={styles.title}>{t('Things To Do')}</div>
      {loading ? (
        <CarouselLoader />
      ) : (
        <div className={styles.container}>
          {hotelCompendiumAmenities?.map((amenity: any) => {
            const showCategoryTitle = categories?.find(
              (category: any) => category.id === amenity?.categoryIds[0],
            );
            return (
              <div
                key={amenity?.id}
                className={styles.wrapper}
                onClick={() => handleClick(showCategoryTitle?.id)}
              >
                <div className={styles.imgWrapper}>
                  <p className={styles.name}>{showCategoryTitle?.name}</p>
                </div>
                <StableImage
                  className={styles.image}
                  src={`${ASSETS_URL}/${amenity?.images[0]?.master}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
