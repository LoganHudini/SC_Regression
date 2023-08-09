import React from 'react';
import cx from 'classnames';
import styles from './Card.module.scss';
import EditIcon from '@icons/edit.svg';
import KeyboardArrowRightIcon from '@icons/ArrowRight.svg';
import { ICardProps } from './Card.types';

export const Card: React.FC<ICardProps> = ({
  children,
  displayShowMoreBtn,
  displayEditBtn,
  isCardOpened,
  onClickShowMore,
  onClickEdit,
}) => {
  return (
    <div className={styles.cardStyles}>
      <>
        {children}
        {displayShowMoreBtn && (
          <button
            className={cx(styles.showMoreBtn, {
              [styles.showMoreBtnOpened]: isCardOpened,
            })}
            type='button'
            onClick={onClickShowMore}
          >
            <KeyboardArrowRightIcon className={styles.showMoreIcon} />
          </button>
        )}
        {displayEditBtn && (
          <button className={styles.editBtn} type='button' onClick={onClickEdit}>
            <EditIcon viewBox='0 0 13.07 13.07' className={styles.editIcon} />
          </button>
        )}
      </>
    </div>
  );
};
