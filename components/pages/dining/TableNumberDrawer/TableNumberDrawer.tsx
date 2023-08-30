import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import { ITableNumberDrawerProps } from './TableNumberDrawer.types';
import styles from './TableNumberDrawer.module.scss';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { TableNumberValidation } from 'validation/tableNumber.validation';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { TextField } from '@mui/material';

export const TableNumberDrawer: React.FC<ITableNumberDrawerProps> = ({
  tableNumberDrawer,
  toggleConfirmDrawerOpened,
  restId,
}) => {
  const { t } = useTranslation(['ui-builder']);
  const [loading, setLoading] = useState(false);
  const navigate = useLocalizedRouter();

  const goToNextPage = useCallback(
    async (values: any) => {
      setLoading(true);
      localStorage.setItem('tableNumber', JSON.stringify(values.tableNumber) ?? '');
      localStorage.setItem('restaurantId', JSON.stringify(restId) ?? '');
      navigate(availablePaths?.DINING);
      setLoading(false);
    },
    [navigate, restId],
  );

  const formik = useFormik({
    initialValues: {
      tableNumber: '',
    },
    validationSchema: TableNumberValidation,
    onSubmit: goToNextPage,
  });

  return (
    <div>
      <div
        onClick={toggleConfirmDrawerOpened}
        className={cx(styles.background, { [styles.backgroundOpened]: tableNumberDrawer })}
      ></div>
      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: tableNumberDrawer })}>
        <div className={styles.confirmationWrapper}>
          <h2 className={styles.title}>{t('Table Number')}</h2>
          <p className={styles.titleContent}>
            {t('Enter the table number to view our delicious menu.')}
          </p>
          <TextField
            required
            type='number'
            sx={{
              '& .MuiFormHelperText-root': {
                '&$.focused': {
                  color: 'white',
                },
                color: 'red',
                marginTop: '5px',
                '&$error': {
                  color: 'red',
                },
              },
            }}
            autoComplete='off'
            className={cx(styles.guestDataInput, styles.demo, {
              [styles.guestDataInputError]: Boolean(formik.errors.tableNumber),
            })}
            InputProps={{
              classes: {
                notchedOutline: styles.customUnderline,
              },
              inputProps: {
                min: 0,
                style: {
                  textAlign: 'center',
                  fontSize: 24,
                  color: '#3D3C3C',
                  marginTop: -4,
                },
              },
            }}
            variant='outlined'
            name={'tableNumber'}
            id={'tableNumber'}
            value={formik.values?.tableNumber}
            onChange={formik.handleChange}
            error={formik.touched.tableNumber && Boolean(formik.errors.tableNumber)}
            helperText={formik?.errors?.tableNumber && t(`${formik?.errors?.tableNumber}`)}
            FormHelperTextProps={{
              style: {
                color: 'red',
              },
            }}
          />
        </div>
        <div className={styles.buttonWrapper}>
          <StyledButton
            loading={loading}
            className={styles.button}
            variant='contained'
            onClick={formik.submitForm}
          >
            {t('Continue')}
          </StyledButton>
        </div>
      </div>
    </div>
  );
};
