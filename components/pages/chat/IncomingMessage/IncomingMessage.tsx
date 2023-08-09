import React from 'react';
import { IIncomingMessageProps } from './IncomingMessage.types';
import styles from './IncomingMessage.module.scss';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';

export const IncomingMessage: React.FC<IIncomingMessageProps> = ({ body, createdAt }) => {
  return (
    <>
      <div className={styles.incomingMessage}>
        <div className={styles.triangle}></div>
        <p className={styles.messageBody}>{body}</p>
        <p className={styles.messageTime}>
          {dayjs(createdAt).format(timeFormats.HOURS_MINUTES_AM)}
        </p>
      </div>
    </>
  );
};
