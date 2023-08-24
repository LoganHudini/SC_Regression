import { StableImage } from 'components/shared/StableImage/StableImage';
import { HOTEL_CODE } from 'core/graphql/endpoints';
import React from 'react';
import styles from './YouMayAlsoLike.module.scss';
import { templateItems } from 'utils/constants';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';

export const YouMayAlsoLike: React.FC = () => {
  const navigate = useLocalizedRouter();

  return (
    <>
      <div className={styles.confirmationWrapper}>
        <h2 className={styles.youMayAlsoLikeText}>{HOTEL_CODE}</h2>
        <div className={styles.youMayAlsoLikeWrapper}>
          <div className={styles.scroll}>
            {templateItems?.map((el, index) => (
              <div
                className={styles.youMayAlsoLikeItem}
                key={index}
                onClick={() => navigate(el?.path)}
              >
                <StableImage className={styles.youMayAlsoLikeItemImage} src={el.image} />
                <p className={styles.youMayAlsoLikeItemText}>{el.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
