import React, { useEffect } from 'react';
import cx from 'classnames';
import styles from './Notification.module.scss';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useReactiveVar } from '@apollo/client';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import { FailureAnimation, SuccessAnimation } from '../Loaders/Loaders';
import { SUCCESS, FAILURE } from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';
import CloseIcon from '@icons/closeButton.svg';

export const Notification: React.FC = () => {
  const { t: errorTranslation } = useTranslation('errors');
  const notificationStatus = useReactiveVar(toggleNotification);
  const notificationDetails = useReactiveVar(notificationStorage);
  const navigate = useLocalizedRouter();
  const config = useConfig();

  const title = notificationDetails?.title;
  const description = notificationDetails?.description;
  const redirect = notificationDetails?.redirect;
  const type = notificationDetails?.type;
  const apolloError = notificationDetails?.apolloError;
  const delay = notificationDetails?.delay;
  const networkError = apolloError?.networkError as {
    result?: { errors?: string; code?: number };
  };

  const handleRedirection = () => {
    if (notificationStatus) {
      toggleNotification(false);
      notificationStorage(null);
      redirect && navigate(redirect);
    }
  };

  useEffect(() => {
    if (notificationStatus) {
      setTimeout(
        () => {
          toggleNotification(false);
          notificationStorage(null);
          redirect && navigate(redirect);
        },
        delay ? delay : 5000,
      );
    }
  }, [delay, navigate, notificationStatus, redirect]);

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
            <p className={styles.title}>{errorTranslation(title)}</p>
            <p className={styles.description}>
              {networkError && apolloError
                ? networkError?.result?.errors === 'invalid room number'
                  ? errorTranslation('Invalid room number')
                  : errorTranslation(networkError?.result?.errors as string)
                : description}
            </p>
          </div>
          <CloseIcon className={styles.close} onClick={handleRedirection} />
        </div>
      )}
    </>
  );
};
