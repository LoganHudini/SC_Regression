import React, { useCallback } from 'react';
import styles from './TimeSelectElement.module.scss';
import cx from 'classnames';
import { ITimeSelectElementProps } from './TimeSelectElement.types';

export const TimeSelectElement: React.FC<ITimeSelectElementProps> = ({
  selected,
  value,
  label,
  onSelectTime,
}) => {
  const onSelect = useCallback(() => {
    onSelectTime(value);
  }, [onSelectTime, value]);

  return (
    <button
      onClick={onSelect}
      className={cx(styles.wrapper, { [styles.wrapperSelected]: selected })}
    >
      {label}
    </button>
  );
};
