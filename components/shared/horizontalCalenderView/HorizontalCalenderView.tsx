import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './HorizontalCalenderView.module.scss';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import cx from 'classnames';
import { bookingDate } from 'storage/home.storage';
import { useReactiveVar } from '@apollo/client';

interface Props {
  reservationInfo: any;
  checkedInData: any;
  setSelectedDate: (date: string) => void;
  selectedDate: string;
}

export const HorizontalCalenderView: React.FC<Props> = ({
  reservationInfo,
  checkedInData,
  setSelectedDate,
  selectedDate,
}) => {
  const useBookingDate = useReactiveVar(bookingDate);

  const checkInDate =
    dayjs(checkedInData?.checkInDate as string) ||
    dayjs(reservationInfo?.details?.checkInDate as string);

  const checkOutDate =
    dayjs(checkedInData?.checkOutDate as string) ||
    dayjs(reservationInfo?.details?.checkOutDate as string);

  const daysInPeriod = useMemo(() => {
    const days: dayjs.Dayjs[] = [];
    const start = checkInDate.subtract(14, 'days');
    const end = checkOutDate.add(14, 'days');
    let currentDate = start;
    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
      days.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }
    return days;
  }, [checkInDate, checkOutDate]);

  const isItineraryDate = (date: dayjs.Dayjs) =>
    date.isBetween(checkInDate, checkOutDate, 'day', '[]');

  const scrollRef = useRef<HTMLDivElement>(null);
  const divRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [currentMonth, setCurrentMonth] = useState(dayjs(checkInDate).format('MMMM YYYY'));
  const ignoreScrollRef = useRef(false);

  const scrollToCenter = (date: string, behavior: ScrollBehavior = 'smooth') => {
    const div = divRefs.current[date];
    if (div && scrollRef.current) {
      div.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
    }
  };

  const handleScroll = useCallback(() => {
    if (ignoreScrollRef.current) {
      ignoreScrollRef.current = false; // reset once used
      return;
    }

    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const containerCenter = container.getBoundingClientRect().left + container.offsetWidth / 2;

    let closestChildIndex = -1;
    let smallestDistance = Infinity;

    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i] as HTMLElement;
      const childRect = child.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;
      const distance = Math.abs(containerCenter - childCenter);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestChildIndex = i;
      }
    }

    if (closestChildIndex !== -1) {
      const newMonth = daysInPeriod[closestChildIndex].format('MMMM YYYY');
      setCurrentMonth(newMonth);
    }
  }, [daysInPeriod]);

  // UseLayoutEffect ensures DOM is ready before scrolling
  useLayoutEffect(() => {
    const initialDate = useBookingDate || selectedDate || checkInDate.format('YYYY-MM-DD');

    const timeoutId = setTimeout(() => {
      const selectedMonth = dayjs(initialDate).format('MMMM YYYY');
      setCurrentMonth(selectedMonth);
      ignoreScrollRef.current = true; // prevent scroll handler from taking over
      scrollToCenter(initialDate, 'auto');
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [useBookingDate, selectedDate]);

  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  const result = daysInPeriod.map((day) => isItineraryDate(day)).filter(Boolean).length <= 1;

  return (
    <>
      {!result ? (
        <>
          <p className={cx(styles.monthText)}>{currentMonth}</p>
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              gap: 1,
              p: 1,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              flexGrow: 1,
            }}
          >
            {daysInPeriod.map((day: dayjs.Dayjs) => {
              const dateString = day.format('YYYY-MM-DD');
              const isItinerary = isItineraryDate(day);

              return (
                <div
                  key={dateString}
                  ref={(el) => (divRefs.current[dateString] = el)}
                  className={cx(styles.monthButtonWrapper, {
                    [styles.monthButtonWrapperSelected]: dateString === selectedDate,
                    [styles.itineraryRange]: isItinerary,
                    [styles.itineraryRangeDisabled]: !isItinerary,
                  })}
                  onClick={() => {
                    bookingDate('');
                    if (isItinerary) {
                      setSelectedDate(dateString);
                      const selectedMonth = dayjs(dateString).format('MMMM YYYY');
                      setCurrentMonth(selectedMonth);

                      // Prevent scroll from overriding
                      ignoreScrollRef.current = true;

                      setTimeout(() => {
                        scrollToCenter(dateString);
                      }, 50);
                    }
                  }}
                >
                  <span className={cx(styles.monthButton)}>
                    {day.format('dd').charAt(0).toUpperCase()}
                  </span>
                  <span className={cx(styles.monthButton)}>{day.format('DD')}</span>
                </div>
              );
            })}
          </Box>
        </>
      ) : (
        <p className={cx(styles.monthText)}>{checkInDate.format('ddd,  D MMMM YYYY')}</p>
      )}
    </>
  );
};
