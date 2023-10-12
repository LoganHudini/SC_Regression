import React, { useEffect } from 'react';
import cx from 'classnames';
import styles from './Notification.module.scss';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useReactiveVar } from '@apollo/client';
import { toggleNotification } from 'storage/home.storage';
import { diningMenuStorage } from 'storage/dining-menu.storage';
import { SuccessAnimation } from '../Loaders/Loaders';

interface INotificationProps {
  title: string;
  description?: string;
  redirect: string;
  type: string;
}

export const Notification: React.FC<INotificationProps> = ({
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
        navigate(redirect);
        toggleNotification(false);
        diningMenuStorage({ items: [] });
      }, 5000);
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
            <SuccessAnimation />
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
