import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import React from 'react';
import styles from './StyledButton.module.scss';
import ButtonArrow from '@icons/buttonArrow.svg';

export const StyledButton: React.FC<LoadingButtonProps & { count?: any; arrow?: any }> = ({
  variant = 'contained',
  count,
  arrow,
  ...props
}) => (
  <LoadingButton {...props} variant={variant}>
    {count && <div className={styles.count}>{count}</div>}
    {props.children}
    {arrow && (
      <div className={styles.arrow}>
        <ButtonArrow />
      </div>
    )}
  </LoadingButton>
);
