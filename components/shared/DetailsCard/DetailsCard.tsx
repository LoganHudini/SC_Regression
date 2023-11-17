import React from 'react';
import styles from './DetailsCard.module.scss';
import { IInfoCardProps } from './DetailsCard.types';
import DropDownIcon from '@icons/dropDownIcon.svg';
import DropUpIcon from '@icons/dropUpIcon.svg';

export const DetailsCard: React.FC<IInfoCardProps> = ({ title, children, icon }) => {
  return (
    <div className={styles.detailsCard}>
      <div className={styles.titleCard}>
        <h3 className={styles.titleText}>{title}</h3>
        {icon && <DropUpIcon />}
      </div>
      <div>{children}</div>
    </div>
  );
};

export const DetailsCardShrinked: React.FC<IInfoCardProps> = ({ title, children }) => {
  return (
    <div className={styles.shrinkedCard}>
      <div className={styles.shrinkedTitleCard}>
        <h3 className={styles.titleText}>{title}</h3>
        <DropDownIcon />
      </div>
      <div>{children}</div>
    </div>
  );
};
