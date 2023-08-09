import FormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import cx from 'classnames';
import styles from './WhiteStyledCheckbox.module.scss';
import React from 'react';
import { Checkbox } from '@mui/material';
import WhiteCheckboxEmptyIcon from '@icons/whiteCheckboxEmpty.svg';
import WhiteCheckboxChecked from '@icons/whiteCheckboxChecked.svg';

export const WhiteStyledCheckbox: React.FC<Partial<FormControlLabelProps> & { label: any }> = (
  props,
) => {
  return (
    <FormControlLabel
      {...props}
      className={cx(props.className, styles.styledRadio)}
      control={
        <Checkbox icon={<WhiteCheckboxEmptyIcon />} checkedIcon={<WhiteCheckboxChecked />} />
      }
    />
  );
};
