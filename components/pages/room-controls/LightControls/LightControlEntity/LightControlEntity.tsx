import React from 'react';
import cx from 'classnames';
import styles from './LightControlEntity.module.scss';
import { ILightControlEntityProps } from './LightControlEntity.types';

export const LightControlEntity: React.FC<ILightControlEntityProps> = ({ icon, title, active }) => {
  return (
    <div
      className={cx(styles.lightControlEntityWrapper, {
        [styles.lightControlEntityWrapperActive]: active,
      })}
    >
      <div className={styles.statusWrapper}>
        <div className={cx(styles.statusIcon, { [styles.statusIconActive]: active })} />
        <p className={cx(styles.statusText, { [styles.statusTextActive]: active })}>
          {active ? 'ON' : 'OFF'}
        </p>
      </div>
      {icon}
      <p className={styles.controlTitle}>{title}</p>
    </div>
  );
};
