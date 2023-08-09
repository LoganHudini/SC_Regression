import React from 'react';
import { IOutgoingMessageProps } from './OutgoingMessage.types';
import styles from './OutgoingMessage.module.scss';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';

export const OutgoingMessage: React.FC<IOutgoingMessageProps> = ({ body, createdAt }) => {
  return (
    <>
      <div className={styles.outgoingMessage}>
        <div className={styles.triangle}></div>
        <p className={styles.messageBody}>{body}</p>
        <p className={styles.messageTime}>
          {dayjs(createdAt).format(timeFormats.HOURS_MINUTES_AM)}
        </p>
      </div>
    </>
  );
};
