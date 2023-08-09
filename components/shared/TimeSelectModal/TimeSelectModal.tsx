import React, { useCallback, useEffect } from 'react';
import styles from './TimeSelectModal.module.scss';
import { ITimeSelectProps } from './TimeSelectModal.types';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import Picker from 'rmc-picker/lib/Picker';
import MultiPicker from 'rmc-picker/lib/MultiPicker';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import 'rmc-picker/assets/index.css';
import dayjs from 'dayjs';

const hoursArray = new Array(24).fill(0).map((_el, index) => String(index).padStart(2, '0'));
const minutesArray = new Array(4).fill(0).map((_el, index) => String(index * 15).padStart(2, '0'));

export const TimeSelect: React.FC<ITimeSelectProps> = ({
  opened,
  toggleOpened,
  setSelectedTime,
  selectedTime,
  minutesArrayProps,
  selectedDate,
  disable,
  setDisable,
}) => {
  const { t } = useTranslation('common');
  const onChange = useCallback(
    (value: [string, string]) => {
      setSelectedTime(value.join(':'));
    },
    [setSelectedTime],
  );

  useEffect(() => {
    if (!selectedTime) {
      setDisable && setDisable(false);
    } else if (
      dayjs().format('HH:mm') >= selectedTime &&
      dayjs(selectedDate).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    ) {
      setDisable && setDisable(true);
    } else {
      setDisable && setDisable(false);
    }
  }, [selectedDate, selectedTime, setDisable, setSelectedTime]);

  return (
    <>
      <div
        onClick={toggleOpened}
        className={cx(styles.timeSelectBackground, { [styles.timeSelectBackgroundOpened]: opened })}
      />
      <div className={cx(styles.timeSelectWrapper, { [styles.timeSelectWrapperOpened]: opened })}>
        <h2 className={styles.title}>{t('Set Time')}</h2>

        <div className={styles.timePickerWrapper}>
          <div className={cx(styles.arrowsWrapper, styles.arrowsWrapperTop)}>
            <div className={styles.arrowContainer}>
              <ArrowBottomIcon className={styles.arrowUpIcon} />
            </div>
            <div className={styles.arrowContainer}>
              <ArrowBottomIcon className={styles.arrowUpIcon} />
            </div>
          </div>
          <MultiPicker onValueChange={onChange} selectedValue={selectedTime?.split(':')}>
            <Picker indicatorClassName='my-picker-indicator'>
              {hoursArray.map((hour) => (
                <Picker.Item className='my-picker-view-item' key={hour} value={hour}>
                  {hour}
                </Picker.Item>
              ))}
            </Picker>
            <Picker indicatorClassName='my-picker-indicator'>
              {!minutesArrayProps
                ? minutesArray?.map((minute) => (
                    <Picker.Item className='my-picker-view-item' key={minute} value={minute}>
                      {minute}
                    </Picker.Item>
                  ))
                : minutesArrayProps.map((minute: string) => (
                    <Picker.Item className='my-picker-view-item' key={minute} value={minute}>
                      {minute}
                    </Picker.Item>
                  ))}
            </Picker>
          </MultiPicker>
          <div className={cx(styles.arrowsWrapper, styles.arrowsWrapperBottom)}>
            <div className={styles.arrowContainer}>
              <ArrowBottomIcon className={styles.arrowDownIcon} />
            </div>
            <div className={styles.arrowContainer}>
              <ArrowBottomIcon className={styles.arrowDownIcon} />
            </div>
          </div>
        </div>
        <div className={styles.buttonWrapper}>
          <StyledButton className={styles.button} onClick={toggleOpened} disabled={disable}>
            {t('Confirm')}
          </StyledButton>
        </div>
      </div>
    </>
  );
};
