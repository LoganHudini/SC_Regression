import React from 'react';
import NothingIcon from '@icons/nothing.svg';
import styles from './NoInformation.module.scss';

const NoInformation = (props: any) => {
  const { message } = props;
  return (
    <div className={styles.information}>
      <NothingIcon className={styles.nothing} />
      <h2 className={styles.infoContent}>{message}</h2>
    </div>
  );
};

export default NoInformation;
