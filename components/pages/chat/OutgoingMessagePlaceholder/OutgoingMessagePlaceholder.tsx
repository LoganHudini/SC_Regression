import React from 'react';
import styles from './OutgoingMessagePlaceholder.module.scss';
import cx from 'classnames';

export const OutgoingMessagePlaceholder: React.FC = () => {
  return (
    <>
      <div className={styles.outgoingMessage}>
        <div className={styles.triangle}></div>
        <p className={cx(styles.messageBody, styles.animation)} />
        <p className={cx(styles.messageTime, styles.animation)} />
      </div>
    </>
  );
};
