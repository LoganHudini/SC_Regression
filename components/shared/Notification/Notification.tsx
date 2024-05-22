import React, { useEffect } from 'react';
import cx from 'classnames';
import styles from './Notification.module.scss';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useReactiveVar } from '@apollo/client';
import { toggleNotification } from 'storage/home.storage';
import { FailureAnimation, SuccessAnimation } from '../Loaders/Loaders';
import { SUCCESS, FAILURE } from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';
import CloseIcon from '@icons/closeButton.svg';

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
  const networkError = apolloError?.networkError as { result?: { errors?: string; code?: number } };
  const config = useConfig();

  const handleRedirection = () => {
    if (notificationStatus) {
      toggleNotification(false);
      redirect && navigate(redirect);
    }
  };

  useEffect(() => {
    if (notificationStatus) {
      setTimeout(() => {
        toggleNotification(false);
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
        <div
          className={cx(styles.wrapper, {
            [styles.wrapperOpened]: notificationStatus,
            [styles.wrapperWithSpacing]: config?.isAnimationActive !== undefined,
          })}
        >
          {config?.isAnimationActive === undefined && (
            <div className={styles.iconWrapper}>
              {type === SUCCESS && <SuccessAnimation />}
              {type === FAILURE && <FailureAnimation />}
            </div>
          )}

          <div
            className={cx(styles.contentWrapper, {
              [styles.contentWrapperWithoutAnimation]: config?.isAnimationActive !== undefined,
            })}
          >
            <p className={styles.title}>{title}</p>
            <p className={styles.description}>
              {networkError && apolloError
                ? networkError?.result?.errors === 'invalid room number'
                  ? 'Invalid room number'
                  : networkError?.result?.errors
                : description}
            </p>
          </div>
          <CloseIcon className={styles.close} onClick={handleRedirection} />
        </div>
      )}
    </>
  );
};
