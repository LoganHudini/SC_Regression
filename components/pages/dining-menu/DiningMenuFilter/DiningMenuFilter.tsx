import React from 'react';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './DiningMenuFilter.module.scss';
import { IDiningMenuFilterProps } from './DiningMenuFilter.types';
import { diningInformationStorage } from 'storage/dining.storage';
import { useReactiveVar } from '@apollo/client';

export const DiningMenuFilter: React.FC<IDiningMenuFilterProps> = ({
  selectedFilter,
  categories,
}) => {
  const filter = useReactiveVar(diningInformationStorage);
  return (
    <div className={styles.diningMenuFilterWrapper}>
      {categories?.map((el: any, index: number) => (
        <div className={styles.diningMenuFilterButtonWrapper} key={`${el}-${index}`}>
          {el.value === selectedFilter ? (
            <StyledButton
              className={styles.diningMenuFilterActive}
              variant='outlined'
              onClick={() =>
                diningInformationStorage({
                  selectedMenu: filter?.selectedMenu,
                  selectedCategory: el?.value,
                })
              }
            >
              {el.title}
            </StyledButton>
          ) : (
            <StyledButton
              className={styles.diningMenuFilterUnActive}
              variant='outlined'
              onClick={() =>
                diningInformationStorage({
                  selectedMenu: filter?.selectedMenu,
                  selectedCategory: el?.value,
                })
              }
            >
              {el.title}
            </StyledButton>
          )}
        </div>
      ))}
    </div>
  );
};
