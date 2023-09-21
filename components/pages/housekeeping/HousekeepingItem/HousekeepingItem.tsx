/* eslint-disable @next/next/no-img-element */
import React from 'react';
import styles from './HousekeepingItem.module.scss';
import { IHousekeepingItemProps } from './HousekeepingItem.types';
import { serviceRequestIcons } from 'utils/serviceRequestIcons';

export const HousekeepingItem: React.FC<IHousekeepingItemProps> = ({
  housekeepingItem,
  handleClick,
}) => {
  const Icon = serviceRequestIcons[housekeepingItem?.icon as keyof typeof serviceRequestIcons];

  return (
    <>
      <div className={styles.housekeepingItemWrapper} onClick={() => handleClick(housekeepingItem)}>
        <div className={styles.iconWrapper}>{Icon && <Icon />}</div>
        <h2 className={styles.housekeepingItemTitle}>{housekeepingItem?.name}</h2>
      </div>
    </>
  );
};
