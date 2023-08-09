import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import styles from './HousekeepingRequestModal.module.scss';
import { useReactiveVar } from '@apollo/client';
import ArrowBottomThinIcon from '@icons/arrowBottomThin.svg';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import { housekeepingStorage } from 'storage/housekeeping.storage';
import produce from 'immer';
import { CalendarPicker } from '@mui/x-date-pickers';
import { DateSelectElement } from 'components/shared/DateSelectElement/DateSelectElement';
import { TimeSelect } from 'components/shared/TimeSelectModal/TimeSelectModal';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useTranslation } from 'react-i18next';
import { CUSTOM } from 'utils/constants';

export const HousekeepingRequestModal: React.FC = () => {
  const { t } = useTranslation('housekeeping');
  const housekeepingInfo = useReactiveVar(housekeepingStorage);

  const opened = housekeepingInfo?.requestModalOpened;
  const hasSelectedItem = housekeepingInfo?.selectedItems?.find(
    (el) => el?.itemId === housekeepingInfo?.currentItem?.id,
  );

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [disable, setDisable] = useState(false);
  const [disableTimeSelect, setDisableTimeSelect] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>();
  const [selectedTime, setSelectedTime] = useState(dayjs().format('HH:mm'));
  const [selectedSchedule, setSelectedSchedule] = useState<string>();
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [timeSelectOpened, setTimeSelectOpened] = useState(false);

  useEffect(() => {
    setSelectedSchedule(hasSelectedItem?.schedule ?? '');
    setSelectedTime(hasSelectedItem?.time ?? dayjs().format('HH:mm'));
    setSelectedDate(hasSelectedItem?.date ?? '');
  }, [hasSelectedItem?.date, hasSelectedItem?.schedule, hasSelectedItem?.time]);

  const expandDescription = useCallback(() => {
    setDescriptionExpanded(true);
  }, []);

  const hideModal = useCallback(() => {
    housekeepingStorage(
      produce(housekeepingStorage(), (draft) => {
        draft.requestModalOpened = false;
      }),
    );
    setSelectedDate('');
    setSelectedSchedule('');
    setSelectedTime(dayjs().format('HH:mm'));
    setDescriptionExpanded(false);
  }, []);

  const toggleTimeSelectOpened = useCallback(() => {
    setTimeSelectOpened((oldState) => !oldState);
  }, []);

  const handleOpenDatePicker = useCallback(() => {
    setDatePickerOpened((oldState) => !oldState);
  }, []);

  const handleDateChange = useCallback((value: dayjs.Dayjs | null) => {
    setSelectedDate(dayjs(value).toISOString());
  }, []);

  const handleSelectSchedule = useCallback((value: string | undefined) => {
    setSelectedSchedule(value ?? '');
    setSelectedDate('');
  }, []);

  const handleAdd = useCallback(() => {
    housekeepingStorage(
      produce(housekeepingStorage(), (draft) => {
        const item = draft?.selectedItems?.find((el) => el?.itemId === draft?.currentItem?.id);

        if (item) {
          const index = draft?.selectedItems?.indexOf(item);
          if (index > -1) {
            draft?.selectedItems?.splice(index, 1);
            setSelectedDate('');
            setSelectedSchedule('');
            setSelectedTime(dayjs().format('HH:mm'));
            setDescriptionExpanded(false);
          }
        } else {
          draft?.selectedItems?.push({
            itemId: draft.currentItem?.id as string,
            code: draft.currentItem?.code as string,
            name: draft.currentItem?.name as string,
            quantity: 1,
            date: selectedDate ? dayjs(selectedDate).format(timeFormats?.DAY_MONTH_YEAR_3) : '',
            time: selectedTime === dayjs().format('HH:mm') ? '' : selectedTime,
            schedule: selectedSchedule ?? '',
            requested: true,
          });
          setSelectedDate('');
          setSelectedSchedule('');
          setSelectedTime(dayjs().format('HH:mm'));
          setDescriptionExpanded(false);
        }
        draft.requestModalOpened = false;
      }),
    );
    setDatePickerOpened(false);
  }, [selectedDate, selectedSchedule, selectedTime]);

  useEffect(() => {
    if (housekeepingInfo.currentItem?.schedule.length === 0) {
      setDisable(false);
    } else if (selectedSchedule === 'CUSTOM') {
      setDisable(
        dayjs(selectedDate).format('YYYY-MM-DD') === 'Invalid Date'
          ? true
          : disableTimeSelect === true
          ? true
          : false,
      );
    } else {
      setDisable(!selectedSchedule ? true : false);
    }
  }, [
    disable,
    disableTimeSelect,
    housekeepingInfo.currentItem?.schedule,
    selectedDate,
    selectedSchedule,
    selectedTime,
  ]);

  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }
  function enableScroll() {
    document.body.style.overflow = '';
  }

  useEffect(() => {
    if (opened) {
      disableScroll();
    } else {
      enableScroll();
    }
  }, [opened]);

  return (
    <>
      <div
        onClick={hideModal}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      ></div>
      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: opened })}>
        <h2 className={styles.title}>{housekeepingInfo.currentItem?.name}</h2>

        <p
          className={cx(styles.housekeepingItemText, {
            [styles.housekeepingItemTextExpanded]: descriptionExpanded,
          })}
        >
          {housekeepingInfo.currentItem?.description}
        </p>
        {housekeepingInfo.currentItem?.description && !descriptionExpanded && (
          <button onClick={expandDescription} className={styles.readMore}>
            {t('Read More...')}
          </button>
        )}

        {housekeepingInfo?.currentItem?.scheduleActive && (
          <div className={styles.containerWrapper}>
            <p className={styles.chooseDateText}>{t('Choose a Date')}</p>
            <div className={styles.dateContainer}>
              {housekeepingInfo?.currentItem?.schedule?.map((schedule) => (
                <DateSelectElement
                  key={schedule}
                  label={schedule}
                  value={schedule}
                  selected={selectedSchedule === schedule}
                  onSelectDate={handleSelectSchedule}
                />
              ))}
            </div>
            {housekeepingInfo.currentItem?.schedule.includes('CUSTOM') &&
              selectedSchedule === CUSTOM &&
              housekeepingInfo.currentItem?.customSchedule?.includes('Date') && (
                <>
                  <div className={styles.chooseAnotherDateRow}>
                    <p className={styles.chooseAnotherDateText}>
                      {selectedDate ? (
                        <>
                          {t('Date selected')}
                          <br />
                          {dayjs(selectedDate).format(timeFormats.DAY_MONTH_YEAR_3)}
                        </>
                      ) : (
                        t('Choose Another Date')
                      )}
                    </p>
                    <ArrowBottomIcon
                      onClick={handleOpenDatePicker}
                      className={cx(styles.chooseAnotherDateArrow, {
                        [styles.chooseAnotherDateArrowOpened]: datePickerOpened,
                      })}
                    />
                  </div>

                  <div
                    className={cx(styles.datePickerWrapper, {
                      [styles.datePickerWrapperOpened]: datePickerOpened,
                    })}
                  >
                    <CalendarPicker
                      className={styles.styledDateInput}
                      onChange={handleDateChange}
                      disablePast={true}
                      date={selectedDate ? dayjs(selectedDate) : null}
                    />
                  </div>
                </>
              )}
            {housekeepingInfo.currentItem?.schedule.includes('CUSTOM') &&
              selectedSchedule === CUSTOM &&
              housekeepingInfo.currentItem?.customSchedule?.includes('Time') && (
                <div className={styles.chooseTimeRow}>
                  <p className={styles.chooseTimeTitle}>{t('Time')}</p>
                  <div className={styles.timeBox} onClick={toggleTimeSelectOpened}>
                    {disableTimeSelect ? dayjs().format('HH:mm') : selectedTime}
                    <ArrowBottomThinIcon className={styles.timeBoxArrow} />
                  </div>
                </div>
              )}
          </div>
        )}

        <StyledButton
          onClick={handleAdd}
          className={styles.button}
          disabled={disable}
          variant={hasSelectedItem ? 'contained' : 'outlined'}
        >
          {hasSelectedItem ? t('Selected') : t('Select')}
        </StyledButton>
      </div>
      <TimeSelect
        disable={disableTimeSelect}
        setDisable={setDisableTimeSelect}
        opened={timeSelectOpened}
        toggleOpened={toggleTimeSelectOpened}
        setSelectedTime={setSelectedTime}
        selectedTime={selectedTime}
        selectedDate={selectedDate}
      />
    </>
  );
};
