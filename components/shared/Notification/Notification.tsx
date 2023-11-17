import React, { useCallback, useEffect } from 'react';
import cx from 'classnames';
import styles from './Notification.module.scss';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useReactiveVar } from '@apollo/client';
import { toggleNotification } from 'storage/home.storage';
import { diningMenuStorage } from 'storage/dining-menu.storage';
import { FailureAnimation, SuccessAnimation } from '../Loaders/Loaders';
import { SUCCESS, FAILURE } from 'utils/constants';

interface INotificationProps {
  title: any;
  description?: any;
  redirect: any;
  type: any;
  apolloError?: any;
}

export const Notification: React.FC<INotificationProps> = ({
  title,
  description,
  redirect,
  type,
  apolloError,
}) => {
  const { t } = useTranslation(['common']);
  const notificationStatus = useReactiveVar(toggleNotification);
  const navigate = useLocalizedRouter();
  const networkError = apolloError?.networkError as { result?: { errors?: string } };

  useEffect(() => {
    if (notificationStatus) {
      setTimeout(() => {
        toggleNotification(false);
        diningMenuStorage({ items: [] });
        redirect && navigate(redirect);
      }, 5000);
    }
  }, [navigate, notificationStatus, redirect]);

  return (
    <>
      <div
        className={cx(styles.background, {
          [styles.backgroundOpened]: notificationStatus && title,
        })}
      ></div>
      {notificationStatus && title && (
        <div className={cx(styles.wrapper, { [styles.wrapperOpened]: notificationStatus })}>
          {
            <div className={styles.iconWrapper}>
              {type === SUCCESS && <SuccessAnimation />}
              {type === FAILURE && <FailureAnimation />}
            </div>
          }
          <div className={styles.contentWrapper}>
            <p className={styles.title}>{title}</p>
            <p className={styles.description}>
              {networkError && apolloError ? networkError?.result?.errors : description}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
