import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import styles from './DiningCategory.module.scss';
import React, { useCallback, useEffect } from 'react';
import { IDinningCategoryProps } from './DinningCategory.types';
import { useCheckedIn } from 'storage/check-in.storage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';

export const DinningCategory: React.FC<IDinningCategoryProps> = ({
  image,
  name,
  selectCategory,
  categoryId,
  hours,
}) => {
  const handleSelect = useCallback(() => {
    selectCategory(categoryId);
  }, [selectCategory, categoryId]);

  const checkinData = useCheckedIn();
  const navigate = useLocalizedRouter();

  useEffect(() => {
    if (!checkinData?.checkedIn) {
      navigate(availablePaths.CHECK_IN);
    }
  }, [checkinData?.checkedIn, navigate]);

  return (
    <div onClick={handleSelect} className={styles.diningElement}>
      <StableImage
        className={styles.diningImage}
        src={image ? `${ASSETS_URL}/${image}` : undefined}
        alt={name}
      />
      <div className={styles.diningText}>
        <h3 className={styles.diningTitle}>{name}</h3>
        {hours?.length > 0 && (
          <p>
            {hours[0]?.open} - {hours[0]?.close}
          </p>
        )}
      </div>
    </div>
  );
};
