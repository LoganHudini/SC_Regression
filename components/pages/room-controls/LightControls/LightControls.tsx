import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import styles from './LightControls.module.scss';
import BedroomLamp from '@icons/bedroomLamp.svg';
import BedroomSofa from '@icons/bedroomSofa.svg';
import TableLamp from '@icons/tableLamp.svg';
import { LightControlEntity } from 'components/pages/room-controls/LightControls/LightControlEntity/LightControlEntity';
import LightsIcon from '@icons/masterLight.svg';
import { useTranslation } from 'react-i18next';

export const LightControls: React.FC = () => {
  const { t } = useTranslation('room-controls');

  const [masterActive, setMasterActive] = useState(false);

  const toggleMasterActive = useCallback(() => {
    setMasterActive((oldState) => !oldState);
  }, []);
  return (
    <>
      <div className={styles.lightControlsWrapper}>
        <div
          className={cx(styles.masterLightControl, {
            [styles.masterLightControlActive]: masterActive,
          })}
          onClick={toggleMasterActive}
        >
          <LightsIcon className={styles.masterLightsIcon} />
          <p className={styles.masterText}>{masterActive ? t('Master on') : t('Master off')}</p>
          <div className={cx(styles.activeIcon, { [styles.activeIconActive]: masterActive })} />
        </div>

        <div className={styles.lightControlEntitiesWrapper}>
          <LightControlEntity active icon={<BedroomLamp />} title={t('BEDROOM LEFT')} />
          <LightControlEntity active icon={<BedroomSofa />} title={t('BEDROOM RIGHT')} />
          <LightControlEntity active icon={<BedroomLamp />} title={t('TABLE LAMP (L)')} />
          <LightControlEntity icon={<TableLamp />} title={t('TABLE LAMP (R)')} />
          <LightControlEntity icon={<BedroomLamp />} title={t('STUDY')} />
          <LightControlEntity active icon={<TableLamp />} title={t('LIVING MAIN')} />
        </div>
      </div>
    </>
  );
};
