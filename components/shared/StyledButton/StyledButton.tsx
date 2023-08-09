import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import React from 'react';

export const StyledButton: React.FC<LoadingButtonProps & { count?: any }> = ({
  variant = 'contained',
  ...props
}) => <LoadingButton {...props} variant={variant} />;
