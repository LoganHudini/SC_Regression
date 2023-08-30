import React from 'react';
import styles from './DetailsCard.module.scss';
import { IInfoCardProps } from './DetailsCard.types';

export const DetailsCard: React.FC<IInfoCardProps> = ({ title, children }) => {
  return (
    <div className={styles.detailsCard}>
      <div
        className={styles.titleText}
        // style={title == 'Add-Ons' ? { backgroundColor: '#B2B2B2', color: 'white' } : {}}
      >
        {title}
      </div>
      <div className={styles.infoCardStyles}>
        <div className={styles.homeCard}></div>
        <div>{children}</div>
      </div>
    </div>
  );
};
