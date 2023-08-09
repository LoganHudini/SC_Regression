import React, { useState } from 'react';
import cx from 'classnames';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './RoomControlsTvListTVListFilter.module.scss';
import { useTranslation } from 'react-i18next';

export const RoomControlsTvListFilter: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { t } = useTranslation('room-controls-tv-list');

  const AVAILABLE_FILTER_VALUES = [t('All'), t('News'), t('Movies'), t('Kids')];

  return (
    <div className={styles.roomControlsTvListFilterWrapper}>
      {AVAILABLE_FILTER_VALUES.map((el, index) => (
        <div className={styles.roomControlsTvListFilterButtonWrapper} key={`${el}-${index}`}>
          <StyledButton
            className={cx({
              [styles.roomControlsTvListFilterActive]: el === activeFilter,
              [styles.roomControlsTvListFilterUnActive]: el !== activeFilter,
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
