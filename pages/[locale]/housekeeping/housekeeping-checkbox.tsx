import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';

import styles from '../../../styles/housekeeping-checkbox/housekeeping-checkbox.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { availablePaths } from 'utils/availablePaths';
import { useReactiveVar } from '@apollo/client';
import { housekeepingStorage } from 'storage/housekeeping.storage';
import ArrowBottomThinIcon from '@icons/arrowBottomThin.svg';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import produce from 'immer';
import { DateSelectElement } from 'components/shared/DateSelectElement/DateSelectElement';
import { CalendarPicker } from '@mui/x-date-pickers';
import cx from 'classnames';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { TimeSelect } from 'components/shared/TimeSelectModal/TimeSelectModal';
import { HousekeepingCheckboxItem } from 'components/pages/housekeeping-checkbox/HousekeepingCheckboxItem/HousekeepingCheckboxItem';
import { housekeepingCheckboxStorage } from 'storage/housekeeping-checkbox.storage';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { CUSTOM } from 'utils/constants';

export { getStaticPaths };

const HousekeepingCheckbox = () => {
  const { t } = useTranslation('housekeeping-checkbox');

  const navigate = useLocalizedRouter();

  const housekeepingInfo = useReactiveVar(housekeepingStorage);
  const housekeepingCheckboxInfo = useReactiveVar(housekeepingCheckboxStorage);
  const hasSelectedItem = housekeepingInfo?.selectedItems?.find(
    (el) => el?.itemId === housekeepingInfo?.currentItem?.id,
  );

  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState(dayjs().format('HH:mm'));
  const [selectedSchedule, setSelectedSchedule] = useState<string>();
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [timeSelectOpened, setTimeSelectOpened] = useState(false);
  const [disable, setDisable] = useState(false);
  const [disableTimeSelect, setDisableTimeSelect] = useState(false);

  useEffect(() => {
    setSelectedSchedule(hasSelectedItem?.schedule ?? '');
    setSelectedTime(hasSelectedItem?.time ?? dayjs().format('HH:mm'));
    setSelectedDate(hasSelectedItem?.date ?? '');
  }, [hasSelectedItem?.date, hasSelectedItem?.schedule, hasSelectedItem?.time]);

  useEffect(() => {
    if (!housekeepingInfo.currentItem) {
      navigate(availablePaths.HOUSEKEEPING);
    }
  }, [housekeepingInfo.currentItem, navigate]);

  // setting another, separate state for this screen, because changes are only applies after clicking the "Add" button
  useEffect(() => {
    housekeepingCheckboxStorage({ selectedItems: [] });
    housekeepingCheckboxStorage(
      produce(housekeepingCheckboxStorage(), (draft) => {
        housekeepingInfo.currentItem?.items.forEach(({ id }) => {
          const preSelectedItem = housekeepingInfo?.selectedItems?.find(
            ({ itemId }) => itemId === id,
          );

          if (preSelectedItem?.schedule) {
            setSelectedSchedule(preSelectedItem?.schedule);
          }

          if (preSelectedItem?.time) {
            setSelectedTime(preSelectedItem?.time);
          }

          if (preSelectedItem?.date) {
            setSelectedDate(preSelectedItem?.date);
          }

          if (preSelectedItem) {
            draft.selectedItems.push({
              itemId: preSelectedItem.itemId,
              quantity: preSelectedItem.quantity,
              requested: preSelectedItem.requested,
            });
          }
        });
      }),
    );
  }, [housekeepingInfo.currentItem?.items, housekeepingInfo.selectedItems]);

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

  const goToConfirmation = useCallback(() => {
    housekeepingStorage(
      produce(housekeepingStorage(), (draft) => {
        housekeepingCheckboxInfo.selectedItems?.forEach((selectedItem) => {
          const item = draft?.selectedItems?.find((el) => el?.itemId === selectedItem?.itemId);

          if (item) {
            item.quantity = selectedItem?.quantity;
            item.requested = selectedItem?.requested;
            item.date = selectedDate;
            item.time = selectedTime;
            item.schedule = selectedSchedule;
          } else {
            draft?.selectedItems.push({
              itemId: selectedItem?.itemId,
              quantity: selectedItem?.quantity,
              code: housekeepingInfo.currentItem?.code as string,
              name: housekeepingInfo.currentItem?.name as string,
              date: selectedDate ? dayjs(selectedDate).format(timeFormats?.DAY_MONTH_YEAR_3) : '',
              time: selectedTime === dayjs().format('HH:mm') ? '' : selectedTime,
              schedule: selectedSchedule,
              requested: selectedItem?.requested,
            });
          }
        });
      }),
    );

    navigate(availablePaths.HOUSEKEEPING);
  }, [
    housekeepingCheckboxInfo.selectedItems,
    housekeepingInfo.currentItem?.code,
    housekeepingInfo.currentItem?.name,
    navigate,
    selectedDate,
    selectedSchedule,
    selectedTime,
  ]);

  useEffect(() => {
    if (selectedSchedule === 'CUSTOM') {
      setDisable(
        dayjs(selectedDate).format('YYYY-MM-DD') === 'Invalid Date'
          ? true
          : disableTimeSelect === true
          ? true
          : !housekeepingCheckboxInfo?.selectedItems[0]?.requested
          ? true
          : false,
      );
    } else {
      setDisable(
        !selectedSchedule
          ? true
          : !housekeepingCheckboxInfo?.selectedItems[0]?.requested
          ? true
          : false,
      );
    }
  }, [
    disableTimeSelect,
    housekeepingCheckboxInfo?.selectedItems,
    housekeepingCheckboxInfo?.selectedItems.length,
    housekeepingInfo?.currentItem?.schedule,
    selectedDate,
    selectedSchedule,
    selectedTime,
  ]);

  return (
    <>
      <Head>
        <title>{t('Services')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Services') as string} />
      <PageWrapper className={styles.pageWrapper}>
        {housekeepingInfo?.currentItem?.name && (
          <h1 className={styles.housekeepingCheckboxTitle}>
            {housekeepingInfo?.currentItem?.name}
          </h1>
        )}
        {housekeepingInfo?.currentItem?.description && (
          <p className={styles.housekeepingCheckboxText}>
            {housekeepingInfo?.currentItem?.description}
          </p>
        )}
        <p className={styles.criteria}>{t('Services')}</p>
        <div className={styles.housekeepingItemsWrapper}>
          {housekeepingInfo.currentItem?.items.map((el, index) => (
            <HousekeepingCheckboxItem title={el.name} key={index} id={el.id} />
          ))}
        </div>
        {housekeepingInfo?.currentItem?.scheduleActive && (
          <>
            <p className={styles.chooseDateText}>{t('Choose A Date')}</p>
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
                      minDate={dayjs(new Date())}
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
                    {selectedTime}
                    <ArrowBottomThinIcon className={styles.timeBoxArrow} />
                  </div>
                </div>
              )}
          </>
        )}

        <div className={styles.addBlock}>
          <div className={styles.buttonWrapper}>
            <StyledButton
              className={styles.orderButton}
              onClick={goToConfirmation}
              disabled={disable}
            >
              {t('CONFIRM')}
            </StyledButton>
          </div>
        </div>
      </PageWrapper>
      <TimeSelect
        opened={timeSelectOpened}
        toggleOpened={toggleTimeSelectOpened}
        setSelectedTime={setSelectedTime}
        selectedTime={selectedTime}
        selectedDate={selectedDate}
        disable={disableTimeSelect}
        setDisable={setDisableTimeSelect}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['common', 'housekeeping-checkbox'],
        i18nConfig,
      )),
    },
  };
};

export default HousekeepingCheckbox;
