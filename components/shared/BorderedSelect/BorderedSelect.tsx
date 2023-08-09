import Select, { SelectProps } from '@mui/material/Select';
import React from 'react';
import styles from './BorderedSelect.module.scss';
import ArrowBottomIcon from '@icons/arrowBottomThin.svg';

export const BorderedSelect: React.FC<SelectProps<string | number>> = (props) => {
  return (
    <div className={styles.selectWrapper}>
      <Select {...props} IconComponent={ArrowBottomIcon} />
    </div>
  );
};
