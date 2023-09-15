import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { DAYS, ALL_DAY, EVERYDAY } from 'utils/constants';
import styles from './RestaurantHours.module.scss';
import TimeIcon from '@icons/clockIcon.svg';

export const RestaurantHours = ({ restaurantHours }: { restaurantHours: any }) => {
    const [selectedDays, setSelectedDays] = useState<any>([]);
    useEffect(() => {
        const daysToMap: any = formatArrayForDisplay(restaurantHours);
        setSelectedDays(daysToMap);
    }, []);

    const formatArrayForDisplay = (selectedDay: any) => {
        const daysToReturn = [];
        let daysList = [...selectedDay];
        while (daysList?.length > 0) {
            const firstObject = daysList[0];
            const filteredRows = daysList?.filter(
                (dayKey) => dayKey?.open === firstObject?.open && dayKey?.close === firstObject?.close,
            );
            daysToReturn?.push({
                day: filteredRows?.map((filteredRowDaysName) => filteredRowDaysName?.day),
                open: filteredRows[0]?.open,
                close: filteredRows[0]?.close,
            });
            const tempDaysList = [...daysList];
            filteredRows?.forEach((filteredRowsItem) => {
                const findFilteredDayIndex = tempDaysList?.findIndex(
                    (tempDaysListItem) => tempDaysListItem?.day === filteredRowsItem?.day,
                );
                tempDaysList?.splice(findFilteredDayIndex, 1);
            });
            daysList = [...tempDaysList];
        }
        return daysToReturn;
    };

    const daysConteniousCheck = (days: any) => {
        const firstIndex = DAYS?.findIndex((day) => day?.name?.toLowerCase() === days[0]?.toLowerCase());
        for (let i = 0; i < days?.length; i++) {
            if (days[i]?.toLowerCase() !== DAYS[(i + firstIndex) % 7]?.name?.toLowerCase()) return false;
        }
        return true;
    };

    const renderDays = (days: any) => {
        if (days?.length > 2) {
            const areDaysContenious = daysConteniousCheck(days);
            if (areDaysContenious) {
                const tempdays = [days[0], days[days?.length - 1]];
                return tempdays
                    ?.map((tempDay) => tempDay?.charAt(0)?.toUpperCase() + tempDay?.slice(1, 3)?.toLowerCase())
                    ?.join(' to ');
            }
            return days
                ?.map((day: any) => {
                    if (day === EVERYDAY) return EVERYDAY;
                    return day?.charAt(0)?.toUpperCase() + day?.slice(1, 3)?.toLowerCase();
                })
                ?.join(', ');
        } else {
            return days[0] === EVERYDAY
                ? EVERYDAY
                : days
                    ?.map((day: any) => day?.charAt(0)?.toUpperCase() + day?.slice(1, 3)?.toLowerCase())
                    ?.join(', ');
        }
    };

    const changeTimeFormat = (open: any, close: any) => {
        return `${dayjs(open, 'HH:mm')?.format('h:mm A')} - ${dayjs(close, 'HH:mm')?.format('h:mm A')}`;
    };

    return (
        <>
            {selectedDays?.length === 1 && selectedDays[0]?.day[0] === EVERYDAY ? (
                <>
                    <div className='row mt-4 mb-2 mx-4'>
                        <div className='col-md-6'>
                            <div className='details-label'>Available On EveryDay</div>
                        </div>
                    </div>
                    <div className='row mt-4 mb-2  mx-4'>
                        <div className='col-md-6'>
                            <div className='details-label'>Hours</div>
                            <div className='details-value'>
                                {selectedDays[0]?.open === ALL_DAY
                                    ? '24*7'
                                    : changeTimeFormat(selectedDays[0]?.open, selectedDays[0]?.close)}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles?.timeWrapperContent}>
                    {selectedDays?.length !== 0 && (
                        <>
                            <div className={styles?.icon}>
                                <TimeIcon className={styles?.timeIcon} />
                            </div>
                            <div className={styles?.timeRowShow}>
                                {selectedDays?.map((timing: any, timeNdx: any) => (
                                    <div className={styles?.timeRowOpen} key={timeNdx}>
                                        <span>{renderDays(timing?.day)}</span>
                                        <span>
                                            {timing?.open === ALL_DAY
                                                ? ALL_DAY
                                                : changeTimeFormat(timing?.open, timing?.close)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {selectedDays?.length === 0 && (
                        <div className='col-md-12'>
                            <div className='details-label'> No hours details available</div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
