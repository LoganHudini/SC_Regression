import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import TvChannelInputIcon from '@icons/tvChannelInput.svg';
import TvChanelListIcon from '@icons/tvChanelList.svg';
import RemoveOutlinedIcon from '@icons/RemoveOutlined.svg';
import AddOutlinedIcon from '@icons/AddOutlined.svg';
import KeyboardArrowUpIcon from '@icons/ArrowUp.svg';
import ArrowDown from '@icons/ArrowDown.svg';
import VolumeOffIcon from '@icons/VolumeOff.svg';
import styles from './TVControls.module.scss';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import { availablePaths } from 'utils/availablePaths';

export const TVControls: React.FC = () => {
  const navigate = useLocalizedRouter();
  const [tvIsOn, setTvIsOn] = useState(false);

  const { t } = useTranslation('room-controls');

  const powerOnTv = useCallback(() => {
    setTvIsOn(true);
  }, []);
  const powerOffTv = useCallback(() => {
    setTvIsOn(false);
  }, []);

  const goToTvChannelInput = useCallback(() => {
    navigate(availablePaths.ROOM_CONTROLS_TV_CHANNEL);
  }, [navigate]);

  const goToTvChannelList = useCallback(() => {
    navigate(availablePaths.ROOM_CONTROLS_TV_LIST);
  }, [navigate]);

  return (
    <div className={styles.tVControlsWrapper}>
      <div className={styles.onOffWrapper}>
        <button
          className={cx(styles.onOffButton, {
            [styles.onOffButtonActive]: tvIsOn,
          })}
          onClick={powerOnTv}
        >
          {t('On')}
        </button>
        <button
          className={cx(styles.onOffButton, {
            [styles.onOffButtonActive]: !tvIsOn,
          })}
          onClick={powerOffTv}
        >
          {t('Off')}
        </button>
      </div>

      <div className={styles.buttonCircle}>
        <button className={styles.buttonCircleInner}>{t('OK')}</button>

        <button className={styles.buttonCircleUpButton} />
        <button className={styles.buttonCircleDownButton} />
        <button className={styles.buttonCircleRightButton} />
        <button className={styles.buttonCircleLeftButton} />
      </div>

      <div className={styles.bottomTvControlsWrapper}>
        <div className={styles.verticalButtonWrapper}>
          <button>
            <AddOutlinedIcon className={styles.volumePlusIcon} />
          </button>
          <p className={styles.verticalButtonText}>{t('VOL')}</p>
          <button>
            <RemoveOutlinedIcon className={styles.volumeMinusIcon} />
          </button>
        </div>
        <div>
          <button className={styles.tVBtn} onClick={goToTvChannelList}>
            <TvChanelListIcon />
          </button>

          <button className={styles.tVBtn} onClick={goToTvChannelInput}>
            <TvChannelInputIcon />
          </button>

          <button className={styles.tVBtn}>
            <VolumeOffIcon className={styles.muteIcon} />
          </button>
        </div>
        <div className={styles.verticalButtonWrapper}>
          <button>
            <KeyboardArrowUpIcon className={styles.channelPlusIcon} />
          </button>
          <p className={styles.verticalButtonText}>{t('CH')}</p>
          <button>
            <ArrowDown className={styles.channelMinusIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};
