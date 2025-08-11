import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import React from 'react';
import styles from './StyledButton.module.scss';

export const StyledButton: React.FC<
  LoadingButtonProps & { count?: any; component?: React.ElementType }
> = ({ variant = 'contained', count, ...props }) => (
  <LoadingButton {...props} variant={variant} disableElevation={true}>
    {count && <div className={styles.count}>{count}</div>}
    {props.children}
  </LoadingButton>
);
