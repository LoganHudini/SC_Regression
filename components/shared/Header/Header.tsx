import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import cx from 'classnames';
import React, { useCallback } from 'react';
import ArrowBackIosIcon from '@icons/ArrowBack.svg';
import HomeIcon from '@icons/home.svg';
import CloseOutlinedIcon from '@icons/CloseOutlined.svg';
import styles from './Header.module.scss';
import { IHeaderProps } from './Header.types';
import { useRouter } from 'next/router';

export const Header: React.FC<IHeaderProps> = ({
  screenTitle,
  transparent,
  displayBackButton,
  displayCloseButton,
  onCloseBtnClick,
  backRoute,
  displayHome,
}) => {
  const navigate = useLocalizedRouter();
  const router = useRouter();

  const goBack = useCallback(() => {
    if (backRoute) {
      navigate(backRoute);
    } else {
      router.back();
    }
  }, [backRoute, navigate, router]);

  return (
    <div className={cx(styles.container, { [styles.containerTransparent]: transparent })}>
      {displayBackButton && (
        <button className={styles.backButton} onClick={goBack}>
          {displayHome ? (
            <HomeIcon className={styles.backIcon} viewBox='0 0 16.204 25.927' />
          ) : (
            <ArrowBackIosIcon className={styles.backIcon} viewBox='0 0 16.204 25.927' />
          )}
        </button>
      )}
      <h1 className={styles.screenTitle}>{screenTitle}</h1>
      {displayCloseButton && (
        <button className={styles.closeButton} onClick={onCloseBtnClick}>
          <CloseOutlinedIcon className={styles.closeIcon} />
        </button>
      )}
    </div>
  );
};
