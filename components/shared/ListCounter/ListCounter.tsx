import React, { useState } from 'react';
import cx from 'classnames';
import styles from './ListCounter.module.scss';
import RemoveOutlinedIcon from '@icons/leftArrow.svg';
import AddOutlinedIcon from '@icons/rightArrow.svg';
import { IListCounterInputProps } from './ListCounter.types';

export const ListCounter: React.FC<IListCounterInputProps> = ({
  values,
  setCurrentIndex,
  currentIndex,
  className,
  valueClassName,
}) => {
  const sortedValues: any =
    values?.length > 0 && [...values].sort((a, b) => a?.duration - b?.duration);

  const handleNext = () => {
    setCurrentIndex((prevIndex: any) =>
      prevIndex < sortedValues?.length - 1 ? prevIndex + 1 : prevIndex,
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex: any) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };
  return (
    <div className={cx(styles.plusMinusInputWrapper)}>
      <button
        className={styles.plusMinusButton}
        disabled={currentIndex === 0 ? true : false}
        onClick={handlePrev}
      >
        <RemoveOutlinedIcon className={styles.minusIcon} />
      </button>
      <p className={cx(styles.value, valueClassName)}>{sortedValues[currentIndex]?.duration}</p>
      <button
        disabled={sortedValues?.length + 1 === currentIndex ? true : false}
        onClick={handleNext}
        className={styles.plusMinusButton}
      >
        <AddOutlinedIcon className={styles.plusIcon} />
      </button>
    </div>
  );
};
