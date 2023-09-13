/* eslint-disable @next/next/no-img-element */
import React from 'react';
import styles from './HousekeepingItem.module.scss';
import { IHousekeepingItemProps } from './HousekeepingItem.types';
import { serviceRequestIcons } from 'utils/serviceRequestIcons';

export const HousekeepingItem: React.FC<IHousekeepingItemProps> = ({
  housekeepingItem,
  handleClick,
}) => {
  const selectedIcon: any = serviceRequestIcons?.find(
    (icon) => housekeepingItem?.icon === icon?.name,
  );

  return (
    <>
      <div className={styles.housekeepingItemWrapper} onClick={() => handleClick(housekeepingItem)}>
        <div className={styles.iconWrapper}>
          {selectedIcon && <img src={selectedIcon?.icon} alt='Icon' width={45} height={45} />}
        </div>
        <h2 className={styles.housekeepingItemTitle}>{housekeepingItem?.name}</h2>
      </div>
    </>
  );
};
