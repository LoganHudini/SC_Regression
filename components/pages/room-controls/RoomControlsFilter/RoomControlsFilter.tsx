import React, { useState } from 'react';
import cx from 'classnames';
import styles from './RoomControlsFilter.module.scss';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';

export const RoomControlsFilter: React.FC = () => {
  const { t } = useTranslation('room-controls');

  const AVAILABLE_FILTER_VALUES = [t('Living'), t('Bedroom'), t('Bathroom')];

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <div className={styles.roomControlsFilterWrapper}>
      {AVAILABLE_FILTER_VALUES.map((el, index) => (
        <div className={styles.roomControlsFilterButtonWrapper} key={`${el}-${index}`}>
          <StyledButton
            className={cx({
              [styles.roomControlsFilterActive]: el === activeFilter,
              [styles.roomControlsFilterUnActive]: el !== activeFilter,
            })}
            variant='outlined'
            onClick={() => setActiveFilter(el)}
          >
            {el}
          </StyledButton>
        </div>
      ))}
    </div>
  );
};
