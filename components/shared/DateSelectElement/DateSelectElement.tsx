import React, { useCallback } from 'react';
import styles from './DateSelectElement.module.scss';
import cx from 'classnames';
import { IDateSelectElementProps } from './DateSelectElement.types';
import { useTranslation } from 'react-i18next';

export const DateSelectElement: React.FC<IDateSelectElementProps> = ({
  selected,
  value,
  label,
  onSelectDate,
}) => {
  const { t } = useTranslation('common');
  const onSelect = useCallback(() => {
    onSelectDate(value);
  }, [onSelectDate, value]);

  return (
    <button
      onClick={onSelect}
      className={cx(styles.wrapper, { [styles.wrapperSelected]: selected })}
    >
      {t(`${label}`)}
    </button>
  );
};
