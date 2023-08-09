import { TextField, TextFieldProps } from '@mui/material';
import cx from 'classnames';
import styles from './StyledInput.module.scss';

export const StyledInput: React.FC<TextFieldProps> = (props) => {
  return <TextField {...props} className={cx(styles.styledInput, props.className)} />;
};
