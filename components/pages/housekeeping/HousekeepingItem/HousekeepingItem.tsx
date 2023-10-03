/* eslint-disable @next/next/no-img-element */
import React from 'react';
import styles from './HousekeepingItem.module.scss';
import { IHousekeepingItemProps } from './HousekeepingItem.types';
import { serviceRequestIcons } from 'utils/serviceRequestIcons';
import cx from 'classnames';

export const HousekeepingItem: React.FC<IHousekeepingItemProps> = ({
  housekeepingItem,
  handleClick,
}) => {
  const Icon = serviceRequestIcons[housekeepingItem?.icon as keyof typeof serviceRequestIcons];

  return (
    <>
      <div className={styles.housekeepingItemWrapper} onClick={() => handleClick(housekeepingItem)}>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon />
          </div>
        )}
        <h2 className={styles.housekeepingItemTitle}>{housekeepingItem?.name}</h2>
      </div>
    </>
  );
};
