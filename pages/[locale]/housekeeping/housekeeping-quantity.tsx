import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useState } from 'react';
import { HousekeepingQuantityItem } from 'components/pages/housekeeping-quantity/HousekeepingQuantityItem/HousekeepingQuantityItem';
import { Header } from 'components/shared/Header/Header';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';
import styles from '../../../styles/housekeeping-quantity/housekeeping-quantity.module.scss';
import ArrowBottomThinIcon from '@icons/arrowBottomThin.svg';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { availablePaths } from 'utils/availablePaths';
import { useReactiveVar } from '@apollo/client';
import { housekeepingStorage } from 'storage/housekeeping.storage';
import { housekeepingQuantityStorage } from 'storage/housekeeping-quantity.storage';
import produce from 'immer';
import { CalendarPicker } from '@mui/x-date-pickers';
import { DateSelectElement } from 'components/shared/DateSelectElement/DateSelectElement';
import { TimeSelect } from 'components/shared/TimeSelectModal/TimeSelectModal';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { getHamburgerProps, IHamburgerProps } from 'utils/hamburger/getHamburgerProps';

export { getStaticPaths };

const availableSchedules = ['TODAY', 'TOMORROW', 'IMMEDIATE'];

const HousekeepingQuantity: React.FC<IHamburgerProps> = ({ hamburger, pages }) => {
  const { t } = useTranslation('housekeeping-quantity');

  const navigate = useLocalizedRouter();

  const housekeepingInfo = useReactiveVar(housekeepingStorage);
  const housekeepingQuantityInfo = useReactiveVar(housekeepingQuantityStorage);

  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState('00:00');
  const [selectedSchedule, setSelectedSchedule] = useState<string>();
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [timeSelectOpened, setTimeSelectOpened] = useState(false);

  useEffect(() => {
    if (!housekeepingInfo.currentItem) {
      navigate(availablePaths.HOUSEKEEPING);
    }
  }, [housekeepingInfo.currentItem, navigate]);

  useEffect(() => {
    housekeepingQuantityInfo?.selectedItems?.every((item) => {
      if (item.quantity === 0) {
        housekeepingStorage(
          produce(housekeepingStorage(), (draft) => {
            housekeepingQuantityInfo.selectedItems?.forEach((selectedItem) => {
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
                  date: selectedDate,
                  time: selectedTime,
                  schedule: selectedSchedule,
                  requested: selectedItem?.requested,
                });
              }
            });
          }),
        );
      }
    });
  }, [
    housekeepingInfo.currentItem?.code,
    housekeepingInfo.currentItem?.name,
    housekeepingQuantityInfo,
    selectedDate,
    selectedSchedule,
    selectedTime,
  ]);

  // setting another, separate state for this screen, because changes are only applies after clicking the "Add" button
  useEffect(() => {
    housekeepingQuantityStorage({ selectedItems: [] });
    housekeepingQuantityStorage(
      produce(housekeepingQuantityStorage(), (draft) => {
        housekeepingInfo?.currentItem?.items?.forEach(({ id }) => {
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

  const goToConfirmation = useCallback(() => {
    housekeepingStorage(
      produce(housekeepingStorage(), (draft) => {
        housekeepingQuantityInfo.selectedItems.forEach((selectedItem) => {
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
              date: selectedDate,
              time: selectedTime,
              schedule: selectedSchedule,
              requested: selectedItem?.requested,
            });
          }
        });
      }),
    );

    navigate(availablePaths.HOUSEKEEPING);
  }, [
    housekeepingInfo.currentItem?.code,
    housekeepingInfo.currentItem?.name,
    housekeepingQuantityInfo.selectedItems,
    navigate,
    selectedDate,
    selectedSchedule,
    selectedTime,
  ]);

  const toggleTimeSelectOpened = useCallback(() => {
    setTimeSelectOpened((oldState) => !oldState);
  }, []);

  const handleOpenDatePicker = useCallback(() => {
    setDatePickerOpened((oldState) => !oldState);
  }, []);

  const handleDateChange = useCallback((value: dayjs.Dayjs | null) => {
    setSelectedSchedule(undefined);
    setSelectedDate(dayjs(value).toISOString());
  }, []);

  const handleSelectSchedule = useCallback((value: string | undefined) => {
    setSelectedSchedule(value);
    setSelectedDate(undefined);
  }, []);

  const shouldDisplaySchedule = housekeepingQuantityInfo.selectedItems?.some((el) => el.requested);

  return (
    <>
      <Head>
        <title>{t('Services')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Services') as string} />
      <PageWrapper className={styles.pageWrapper} hamburger={hamburger} pages={pages}>
        <h1 className={styles.housekeepingQuantityTitle}>{housekeepingInfo.currentItem?.name}</h1>
        <p className={styles.housekeepingQuantityText}>
          {housekeepingInfo.currentItem?.description}
        </p>
        <div className={styles.housekeepingQuantityRow}>
          <p className={styles.criteria}>{t('Items Required')}</p>
          <p className={styles.criteria}>{t('Quantity')}</p>
        </div>
        <div className={styles.housekeepingItemsWrapper}>
          {housekeepingInfo.currentItem?.items.map((el, index) => (
            <HousekeepingQuantityItem
              id={el.id}
              title={el.name}
              maxQuantity={el.maxQuantity}
              maxQuantityActive={el.maxQuantityActive}
              key={index}
            />
          ))}
        </div>
        {housekeepingInfo.currentItem?.scheduleActive && shouldDisplaySchedule && (
          <>
            <p className={styles.chooseDateText}>{t('Choose A Date')}</p>
            <div className={styles.dateContainer}>
              {availableSchedules.map(
                (schedule) =>
                  housekeepingInfo.currentItem?.schedule.includes(schedule) && (
                    <DateSelectElement
                      key={schedule}
                      label={schedule}
                      value={schedule}
                      selected={selectedSchedule === schedule}
                      onSelectDate={handleSelectSchedule}
                    />
                  ),
              )}
            </div>
            {housekeepingInfo.currentItem?.schedule.includes('CUSTOM') &&
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
          <StyledButton
            className={styles.orderButton}
            onClick={goToConfirmation}
            disabled={housekeepingQuantityInfo?.selectedItems?.every((item) => item.quantity === 0)}
          >
            {t('CONFIRM')}
          </StyledButton>
        </div>
      </PageWrapper>

      <TimeSelect
        opened={timeSelectOpened}
        toggleOpened={toggleTimeSelectOpened}
        setSelectedTime={setSelectedTime}
        selectedTime={selectedTime}
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
        ['common', 'housekeeping-quantity'],
        i18nConfig,
      )),
      ...(await getHamburgerProps()),
    },
  };
};

export default HousekeepingQuantity;
