import React, { useEffect } from 'react';
import styles from './Stepper.module.scss';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Arrow from '@icons/stepperArrow.svg';
import cx from 'classnames';
import { useReactiveVar } from '@apollo/client';
import { StepperInformationStorage } from 'storage/check-in.storage';

export const Stepper: React.FC = () => {
  const stepperInformation = useReactiveVar(StepperInformationStorage);

  function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number; label?: string },
  ) {
    const { value, label, title } = props;
    return (
      <>
        <div className={styles.contentWrapper}>
          <div
            className={cx(styles.mainWrapper, {
              [styles.completed]: value === 100,
            })}
          >
            <CircularProgress
              variant='determinate'
              style={{ color: 'var(--primary-theme-color)' }}
              color='inherit'
              size={35}
              {...props}
            />
            <div className={styles.secWrapper}>
              <span
                className={cx(styles.label, {
                  [styles.labelCompleted]: value === 100,
                })}
              >
                {label}
              </span>
            </div>
          </div>
          <span className={styles.title}>{title}</span>
        </div>
      </>
    );
  }

  return (
    <div className={styles.wrapper}>
      {stepperInformation?.map((item: any, index: number) => (
        <React.Fragment key={index}>
          <CircularProgressWithLabel value={item?.value} label={item?.label} title={item?.title} />
          {index < stepperInformation?.length - 1 && (
            <span className={styles.arrowPlacement}>
              <Arrow />
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
