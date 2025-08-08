import React from 'react';
import styles from './DetailsCard.module.scss';
import { IInfoCardProps } from './DetailsCard.types';
import DropDownIcon from '@icons/dropDownIcon.svg';
import DropUpIcon from '@icons/dropUpIcon.svg';
import cx from 'classnames';

export const DetailsCard: React.FC<IInfoCardProps> = ({
  title,
  children,
  icon,
  handleClick,
  customTextClassName,
  customBorderClassName,
}) => {
  return (
    <div className={styles.detailsCard}>
      <div
        className={cx(customBorderClassName, styles.titleCard)}
        onClick={(e) => handleClick && handleClick(e)}
      >
        <h3 className={cx(customTextClassName, styles.titleText)}>
          {title}
          {customTextClassName && ' *'}
        </h3>
        {icon && <DropUpIcon />}
      </div>
      <div>{children}</div>
    </div>
  );
};

export const DetailsCardShrinked: React.FC<IInfoCardProps> = ({
  title,
  children,
  handleClick,
  error = true,
}) => {
  return (
    <div
      className={cx(styles.shrinkedCard, {
        [styles.error]: !error,
      })}
      onClick={(e) => handleClick && handleClick(e)}
    >
      <div className={styles.shrinkedTitleCard}>
        <h3 className={styles.titleText}>{title}</h3>
        <DropDownIcon />
      </div>
      <div>{children}</div>
    </div>
  );
};
