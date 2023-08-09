import React, { useCallback } from 'react';
import DeleteNotificationIcon from '@icons/deleteNotification.svg';
import styles from './Notification.module.scss';
import { INotificationProps } from './Notification.types';
import { useTranslation } from 'react-i18next';

export const Notification: React.FC<INotificationProps> = ({
  title,
  description,
  date,
  id,
  handleDelete,
}) => {
  const handleTouchEnd = useCallback(() => {
    const element = document.querySelector(`#notification-${id}`);
    if (element) {
      if (element.scrollLeft >= 90 && handleDelete) {
        handleDelete();
      }

      element.scrollLeft = 0; // Scroll to the top of the block element
    }
  }, [handleDelete, id]);

  const { t } = useTranslation('notifications');

  return (
    <div id={`notification-${id}`} onTouchEnd={handleTouchEnd} className={styles.wrapper}>
      <div className={styles.main}>
        <h2 className={styles.notificationTitle}>{title}</h2>

        <p className={styles.notificationDescription}>{description}</p>

        <p className={styles.notificationDate}>{date}</p>

        <div className={styles.dot} />
      </div>
      <button className={styles.deleteBtn}>
        <DeleteNotificationIcon />
        <p className={styles.deteleText}>{t('Delete')}</p>
      </button>
    </div>
  );
};
