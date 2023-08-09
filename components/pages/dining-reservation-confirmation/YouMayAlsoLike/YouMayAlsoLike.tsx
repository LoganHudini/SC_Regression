import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './YouMayAlsoLike.module.scss';
import { IYouMayAlsoLikeProps } from './YouMayAlsoLike.types';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';

export const YouMayAlsoLike = ({ items }: any) => {
  const { t } = useTranslation('dining-reservation-confirmation');
  const navigate = useLocalizedRouter();

  return (
    <>
      <div className={styles.confirmationWrapper}>
        <h2 className={styles.youMayAlsoLikeText}>{t('You May Also Like')}</h2>
        <div className={styles.youMayAlsoLikeWrapper}>
          <div className={styles.scroll}>
            {items.map((el: any, index: number) => (
              <div
                className={styles.youMayAlsoLikeItem}
                key={index}
                onClick={() => navigate(availablePaths?.DINING)}
              >
                <StableImage
                  className={styles.youMayAlsoLikeItemImage}
                  src={`${ASSETS_URL}/${el?.images[0] ? el?.images[0]?.master : null}`}
                  alt={el?.name}
                />
                <p className={styles.youMayAlsoLikeItemText}>{el?.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
