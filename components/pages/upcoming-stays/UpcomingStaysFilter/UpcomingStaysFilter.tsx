import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './UpcomingStaysFilter.module.scss';
import { IUpcomingStaysFilterProps, TimeFilter } from './UpcomingStaysFilter.types';

const AVAILABLE_FILTER_VALUES = [TimeFilter.Current, TimeFilter.Upcoming, TimeFilter.Past];

export const UpcomingStaysFilter: React.FC<IUpcomingStaysFilterProps> = ({
  selectedFilter,
  setSelectedFilter,
}) => {
  const { t } = useTranslation('trips');

  const filtersMap = {
    [TimeFilter.Current]: t('Current'),
    [TimeFilter.Upcoming]: t('Upcoming'),
    [TimeFilter.Past]: t('Past'),
  };

  return (
    <div className={styles.upcomingStaysFilterWrapper}>
      {AVAILABLE_FILTER_VALUES.map((el, index) => (
        <div className={styles.upcomingStaysFilterButtonWrapper} key={`${el}-${index}`}>
          {el === selectedFilter ? (
            <StyledButton
              className={styles.upcomingStaysFilterActive}
              variant='outlined'
              onClick={() => setSelectedFilter(el)}
            >
              {filtersMap[el]}
            </StyledButton>
          ) : (
            <StyledButton
              className={styles.upcomingStaysFilterUnActive}
              variant='outlined'
              onClick={() => setSelectedFilter(el)}
            >
              {filtersMap[el]}
            </StyledButton>
          )}
        </div>
      ))}
    </div>
  );
};
