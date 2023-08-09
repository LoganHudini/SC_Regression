import React, { useCallback } from 'react';
import cx from 'classnames';
import { ControlableEntities } from '../../../../types/room-controls.types';
import styles from './ControlEntities.module.scss';
import LightsIcon from '@icons/lights.svg';
import TempIcon from '@icons/temp.svg';
import TVIcon from '@icons/tv.svg';
import { IControlEntitiesProps } from './ControlEntities.types';
import { useTranslation } from 'react-i18next';

const ControlEntities: React.FC<IControlEntitiesProps> = ({ setActiveControl, activeControl }) => {
  const { t } = useTranslation('room-controls');

  const selectLightsEntity = useCallback(() => {
    setActiveControl(ControlableEntities.LIGHTS);
  }, [setActiveControl]);

  const selectTempEntity = useCallback(() => {
    setActiveControl(ControlableEntities.TEMP);
  }, [setActiveControl]);

  const selectTVEntity = useCallback(() => {
    setActiveControl(ControlableEntities.TV);
  }, [setActiveControl]);

  return (
    <div className={styles.controlEntitiesWrapper}>
      <div
        className={cx(styles.controlEntity, {
          [styles.controlEntityActive]: activeControl === ControlableEntities.LIGHTS,
        })}
        onClick={selectLightsEntity}
      >
        <div className={styles.controlEntityIconWrapper}>
          <LightsIcon className={styles.lightsControlEntityIcon} />
        </div>
        <p className={styles.controlEntityText}>{t('Lights')}</p>
      </div>
      <div
        onClick={selectTempEntity}
        className={cx(styles.controlEntity, {
          [styles.controlEntityActive]: activeControl === ControlableEntities.TEMP,
        })}
      >
        <div className={styles.controlEntityIconWrapper}>
          <TempIcon className={styles.tempControlEntityIcon} />
        </div>
        <p className={styles.controlEntityText}>{t('Temp')}</p>
      </div>
      <div
        onClick={selectTVEntity}
        className={cx(styles.controlEntity, {
          [styles.controlEntityActive]: activeControl === ControlableEntities.TV,
        })}
      >
        <div className={styles.controlEntityIconWrapper}>
          <TVIcon className={styles.tVControlEntityIcon} />
        </div>
        <p className={styles.controlEntityText}>{t('TV')}</p>
      </div>
    </div>
  );
};

export default ControlEntities;
