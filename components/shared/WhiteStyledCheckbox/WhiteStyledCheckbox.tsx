import FormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import cx from 'classnames';
import styles from './WhiteStyledCheckbox.module.scss';
import React from 'react';
import { Checkbox } from '@mui/material';

export const WhiteStyledCheckbox: React.FC<Partial<FormControlLabelProps> & { label: any }> = (
  props,
) => {
  return (
    <FormControlLabel
      {...props}
      className={cx(props.className, styles.styledRadio)}
      control={
        <Checkbox
          checked={props.checked}
          sx={{
            color: 'var(--primary-theme-color)',
            '&.Mui-checked': {
              color: 'var(--primary-theme-color)',
            },
          }}
        />
      }
    />
  );
};
