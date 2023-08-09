import React from 'react';
import styles from './IncomingMessagePlaceholder.module.scss';
import cx from 'classnames';

export const IncomingMessagePlaceholder: React.FC = () => {
  return (
    <>
      <div className={styles.incomingMessage}>
        <div className={styles.triangle}></div>
        <p className={cx(styles.messageBody, styles.animation)} />
        <p className={cx(styles.messageTime, styles.animation)} />
      </div>
    </>
  );
};
