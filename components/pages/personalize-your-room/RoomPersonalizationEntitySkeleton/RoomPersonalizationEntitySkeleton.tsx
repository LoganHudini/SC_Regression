import React from 'react';
import styles from './RoomPersonalizationEntitySkeleton.module.scss';
import cx from 'classnames';

export const RoomPersonalizationEntitySkeleton: React.FC = () => {
  return (
    <div className={styles.roomPersonalizationEntityWrapper}>
      <div className={styles.roomPersonalizationFirstColumn}>
        <h2 className={cx(styles.roomPersonalizationTitle, styles.animation)}></h2>
        <p className={cx(styles.roomPersonalizationText, styles.animation)}></p>
      </div>
      <div className={styles.roomPersonalizationControls}>
        <p className={cx(styles.perDay, styles.animation)} />
        <p className={styles.price}>
          <span className={cx(styles.priceSmall, styles.animation)}></span>
          <span className={cx(styles.priceBig, styles.animation)}></span>
        </p>
        <div className={cx(styles.addButton, styles.animation)}></div>
      </div>
    </div>
  );
};
