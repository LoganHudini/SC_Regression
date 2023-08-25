import styles from './DiningCategory.module.scss';
import React, { useCallback, useState } from 'react';
import { IDinningCategoryProps } from './DinningCategory.types';
import { diningInformationStorage } from 'storage/dining.storage';
import cx from 'classnames';
import { ALL_DAY } from 'utils/constants';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'react-i18next';

export const DinningCategory: React.FC<IDinningCategoryProps> = ({
  name,
  selectCategory,
  categoryId,
  hours,
}) => {
  const { t } = useTranslation('dining');
  const [selected, setSelected] = useState('');
  const diningInformation = useReactiveVar(diningInformationStorage);
  const handleSelect = useCallback(
    (event: any) => {
      setSelected(event?.target?.id);
      selectCategory(categoryId ?? '', name ?? '', hours ?? '');
      diningInformationStorage({
        selectedMenu: categoryId,
        menuName: name,
      });
    },
    [selectCategory, categoryId, name, hours],
  );

  return (
    <>
      <div id={name} onClick={(e) => handleSelect(e)} className={styles.diningElement}>
        <div className={styles.diningText}>
          <h3
            id={name}
            className={cx(styles.diningTitle, {
              [styles.selected]: diningInformation?.menuName === name,
            })}
          >
            {name}
          </h3>
          {hours?.length > 0 && (
            <p className={styles.diningTitleTime}>
              {hours[0]?.open === ALL_DAY
                ? t(`${hours[0]?.open}`)
                : `${hours[0]?.open} - ${hours[0]?.close === '00:00' ? '24:00' : hours[0]?.close}`}
            </p>
          )}
        </div>
      </div>
    </>
  );
};
