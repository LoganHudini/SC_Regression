import React from 'react';
import cx from 'classnames';
import styles from './PlusMinusInput.module.scss';
import RemoveOutlinedIcon from '@icons/RemoveOutlined.svg';
import AddOutlinedIcon from '@icons/AddOutlined.svg';
import { IPlusMinusInputProps } from './PlusMinusInput.types';

export const PlusMinusInput: React.FC<IPlusMinusInputProps> = ({
  value,
  onClickMinus,
  onClickPlus,
  minQuantity,
  maxQuantity,
  irdSummary,
  className,
}) => {
  return (
    <div className={cx(styles.plusMinusInputWrapper, className)}>
      <button
        className={cx(styles.plusMinusButton, irdSummary && styles.plusMinusButtonIrd)}
        disabled={value <= (minQuantity || 0)}
        onClick={onClickMinus}
      >
        <RemoveOutlinedIcon className={styles.minusIcon} />
      </button>
      <p className={styles.value}>{value}</p>
      <button
        disabled={maxQuantity ? value === maxQuantity : false}
        onClick={onClickPlus}
        className={cx(styles.plusMinusButton, irdSummary && styles.plusMinusButtonIrd)}
      >
        <AddOutlinedIcon className={styles.plusIcon} />
      </button>
    </div>
  );
};
