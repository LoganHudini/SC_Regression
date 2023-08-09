import FormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import cx from 'classnames';
import Radio from '@mui/material/Radio';
import styles from './StyledRadio.module.scss';
import React from 'react';

export const StyledRadio: React.FC<Partial<FormControlLabelProps> & { label: string }> = (
  props,
) => {
  return (
    <FormControlLabel
      {...props}
      className={cx(props.className, styles.styledRadio)}
      control={<Radio />}
    />
  );
};
