import React, { useCallback, useEffect } from 'react';
import cx from 'classnames';
import { IThankYouDrawerProps } from './ThankYouDrawer.types';
import styles from './ThankYouDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import CheckMark from '@icons/thinCheckMark.svg';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { diningMenuStorage } from 'storage/dining-menu.storage';
import { DINING, HOUSEKEEPING, RESTAURANTS_BARS } from 'utils/constants';

export const ThankYouDrawer: React.FC<IThankYouDrawerProps> = ({
  opened,
  title,
  redirect,
  close,
}) => {
  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();

  const goToHomePage = useCallback(() => {
    close(false);
    redirect === HOUSEKEEPING && navigate(availablePaths.HOUSEKEEPING);
    redirect === DINING && navigate(availablePaths.DINING);
    redirect === RESTAURANTS_BARS && navigate(availablePaths.RESTAURANTS_BARS);
    diningMenuStorage({ items: [] });
  }, [close, navigate, redirect]);

  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  function enableScroll() {
    document.body.style.overflow = '';
  }

  useEffect(() => {
    if (opened) {
      disableScroll();
    } else {
      enableScroll();
    }
  }, [opened]);

  return (
    <div>
      <div
        onClick={goToHomePage}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      ></div>
      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: opened })}>
        <div className={styles.iconWrapper}>
          <CheckMark />
        </div>
        <p className={styles.heading}> {t('Thank You')}</p>
        <p className={styles.title}>{title}</p>
        <div>
          <div className={styles.buttonWrapper}>
            <StyledButton variant='contained' onClick={goToHomePage}>
              {t('OK')}
            </StyledButton>
          </div>
        </div>
      </div>
    </div>
  );
};
