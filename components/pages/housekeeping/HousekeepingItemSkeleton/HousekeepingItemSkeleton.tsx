import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React from 'react';
import cx from 'classnames';
import styles from './HousekeepingItemSkeleton.module.scss';

export const HousekeepingItemSkeleton: React.FC = () => {
  return (
    <div className={styles.housekeepingItemWrapper}>
      <h2 className={cx(styles.housekeepingItemTitle, styles.animation)} />
      <p className={cx(styles.housekeepingItemText, styles.animation)} />
      <button className={cx(styles.readMore, styles.animation)} />

      <div className={styles.quantityWrapper}>
        <StyledButton className={cx(styles.button, styles.animation)} variant={'outlined'} />
      </div>
    </div>
  );
};
