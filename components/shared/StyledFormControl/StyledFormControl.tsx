import { FormControl, FormControlTypeMap } from '@mui/material';
import React from 'react';
import cx from 'classnames';
import styles from './StyledFormControl.module.scss';

export const StyledFormControl: React.FC<FormControlTypeMap['props'] & { className: string }> = (
  props,
) => {
  return <FormControl {...props} className={cx(styles.styledFormControl, props.className)} />;
};
