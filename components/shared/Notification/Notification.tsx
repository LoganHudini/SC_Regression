import React, { useEffect } from 'react';
import cx from 'classnames';
import styles from './Notification.module.scss';
import { useTranslation } from 'react-i18next';
import CheckMark from '@icons/thinCheckMark.svg';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { DINING, HOUSEKEEPING, RESTAURANTS_BARS } from 'utils/constants';
import { useReactiveVar } from '@apollo/client';
import { toggleNotification } from 'storage/home.storage';
import { diningMenuStorage } from 'storage/dining-menu.storage';

interface IThankYouDrawerProps {
  title: string;
  description?: string;
  redirect: string;
  type: string;
}

export const Notification: React.FC<IThankYouDrawerProps> = ({
  title,
  description,
  redirect,
  type,
}) => {
  const { t } = useTranslation(['common']);
  const notificationStatus = useReactiveVar(toggleNotification);
  const navigate = useLocalizedRouter();

  useEffect(() => {
    if (notificationStatus) {
      setTimeout(() => {
        redirect === HOUSEKEEPING && navigate(availablePaths.HOUSEKEEPING);
        redirect === DINING && navigate(availablePaths.DINING);
        redirect === RESTAURANTS_BARS && navigate(availablePaths.RESTAURANTS_BARS);
        toggleNotification(false);
        diningMenuStorage({ items: [] });
      }, 4000);
    }
  }, [navigate, notificationStatus, redirect]);

  return (
    <>
      <div
        className={cx(styles.background, { [styles.backgroundOpened]: notificationStatus })}
      ></div>
      {notificationStatus && (
        <div className={cx(styles.wrapper, { [styles.wrapperOpened]: notificationStatus })}>
          <div className={styles.iconWrapper}>
            <CheckMark className={styles.icon} />
          </div>
          <div className={styles.contentWrapper}>
            <p className={styles.title}>{title}</p>
            <p className={styles.description}>{description}</p>
          </div>
        </div>
      )}
    </>
  );
};
