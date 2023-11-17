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

  const hotelAmenities = categories?.map((category: any) =>
    amenities?.find(
      (amenity: any) =>
        amenity?.images?.length > 0 &&
        amenity?.isActive &&
        amenity?.categoryIds.includes(category?.id),
    ),
  );

  return (
    <>
      {loading ? (
        <CarouselLoader />
      ) : (
        categories?.length > 0 && (
          <>
            <div className={styles.title}>{t('Things To Do')}</div>
            <div className={styles.container}>
              {categories?.map((category: any, index: number) => (
                <div
                  key={index}
                  className={styles.wrapper}
                  onClick={() => handleClick(category?.id)}
                >
                  <div className={styles.imgWrapper}>
                    <p className={styles.name}>{category?.name}</p>
                  </div>
                  <StableImage
                    className={styles.image}
                    src={`${ASSETS_URL}/${hotelAmenities[index]?.images[0]?.master}`}
                  />
                </div>
              ))}
            </div>
          </>
        )
      )}
    </>
  );
};
