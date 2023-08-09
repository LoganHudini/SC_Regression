import { Checkbox, CheckboxProps } from '@mui/material';
import cx from 'classnames';
import styles from './StyledCheckBox.module.scss';
import React from 'react';

export const StyledCheckBox: React.FC<CheckboxProps> = (props) => {
  return <Checkbox {...props} className={cx(props.className, styles.styledCheckBox)} />;
};
