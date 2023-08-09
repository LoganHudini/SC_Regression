import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import { TempMeasurementUnits, TempState } from '../../../../types/room-controls.types';
import TemperaturePlusBtnIcon from '@icons/temperaturePlusBtn.svg';
import TemperatureMinusBtnIcon from '@icons/temperatureMinusBtn.svg';
import VentilatorSmallIcon from '@icons/ventilatorSmallIcon.svg';
import VentilatorMediumIcon from '@icons/ventilatorMediumIcon.svg';
import VentilatorBigIcon from '@icons/ventilatorBigIcon.svg';
import TempIconSmall from '@icons/tempIconSmall.svg';
import styles from './TempControls.module.scss';
import { useTranslation } from 'react-i18next';

export const TempControls: React.FC = () => {
  const [tempOn, setTempOn] = useState(false);
  const [tempControlUnit, setTempControlUnit] = useState(TempMeasurementUnits.CELSIUS);
  const [tempState, setTempState] = useState(TempState.AUTO);

  const { t } = useTranslation('room-controls');

  const powerOnTv = useCallback(() => {
    setTempOn(true);
  }, []);
  const powerOffTv = useCallback(() => {
    setTempOn(false);
  }, []);

  const selectCelsius = useCallback(() => {
    setTempControlUnit(TempMeasurementUnits.CELSIUS);
  }, []);
  const selectFahrenheit = useCallback(() => {
    setTempControlUnit(TempMeasurementUnits.FAHRENHEIT);
  }, []);

  const selectAuto = useCallback(() => {
    setTempState(TempState.AUTO);
  }, []);
  const selectEco = useCallback(() => {
    setTempState(TempState.ECO);
  }, []);

  return (
    <div className={styles.tempControlsWrapper}>
      <div className={styles.topTempControls}>
        <div className={styles.autoEcoSwitcher}>
          <button
            className={cx(styles.autoEcoButton, {
              [styles.autoEcoButtonActive]: tempState == TempState.AUTO,
            })}
            onClick={selectAuto}
          >
            {t('Auto')}
          </button>
          <button
            className={cx(styles.autoEcoButton, {
              [styles.autoEcoButtonActive]: tempState == TempState.ECO,
            })}
            onClick={selectEco}
          >
            {t('Eco')}
          </button>
        </div>

        <div className={styles.ventilatorControls}>
          <button
            className={cx(styles.ventilatorControl, {
              [styles.ventilatorControlActive]: true,
            })}
          >
            <VentilatorSmallIcon />
          </button>
          <button className={styles.ventilatorControl}>
            <VentilatorMediumIcon />
          </button>
          <button className={styles.ventilatorControl}>
            <VentilatorBigIcon />
          </button>
        </div>
      </div>

      <p className={styles.temperatureText}>{t('Set temperature to')}</p>

      <div className={styles.temperatureControlsWrapper}>
        <button className={styles.temperatureControlsButton}>
          <TemperatureMinusBtnIcon />
        </button>

        <div className={styles.currentTemperatureWrapper}>
          <p className={styles.currentTemperatureText}>24</p>
          <p className={styles.currentTemperatureGrades}>0</p>
          <p className={styles.currentTemperatureMeasureUnit}>C</p>
        </div>

        <button className={styles.temperatureControlsButton}>
          <TemperaturePlusBtnIcon />
        </button>
      </div>

      <div className={styles.onOffWrapper}>
        <button
          className={cx(styles.onOffButton, {
            [styles.onOffButtonActive]: tempOn,
          })}
          onClick={powerOnTv}
        >
          {t('On')}
        </button>
        <button
          className={cx(styles.onOffButton, {
            [styles.onOffButtonActive]: !tempOn,
          })}
          onClick={powerOffTv}
        >
          {t('Off')}
        </button>
      </div>

      <div className={styles.tempMeasureUnitSwitcher}>
        <div
          className={cx(styles.tempMeasureUnit, {
            [styles.tempMeasureUnitActive]: tempControlUnit === TempMeasurementUnits.CELSIUS,
          })}
          onClick={selectCelsius}
        >
          <TempIconSmall className={styles.temperatureIcon} />
          <p className={styles.tempMeasureUnitText}>° C</p>
        </div>

        <div
          className={cx(styles.tempMeasureUnit, {
            [styles.tempMeasureUnitActive]: tempControlUnit === TempMeasurementUnits.CELSIUS,
          })}
          onClick={selectFahrenheit}
        >
          <TempIconSmall className={styles.temperatureIcon} />
          <p className={styles.tempMeasureUnitText}>° F</p>
        </div>
      </div>
    </div>
  );
};
