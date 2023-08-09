import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import cx from 'classnames';
import React, { useCallback } from 'react';
import ArrowBackIosIcon from '@icons/ArrowBack.svg';
import FairmontLogo from '@icons/fairmontLogo.svg';
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
      <div className={styles.logoContainer}>
        {displayBackButton && (
          <button className={styles.backButton} onClick={goBack}>
            <ArrowBackIosIcon className={styles.backIcon} viewBox='0 0 16.204 25.927' />
          </button>
        )}
        <FairmontLogo className={styles.backlog} />
      </div>
      <div className={styles.headerContainer}>
        <h1 className={styles.screenTitle}>{screenTitle}</h1>
        {displayCloseButton && (
          <button className={styles.closeButton} onClick={onCloseBtnClick}>
            <CloseOutlinedIcon className={styles.closeIcon} />
          </button>
        )}
      </div>
    </div>
  );
};
