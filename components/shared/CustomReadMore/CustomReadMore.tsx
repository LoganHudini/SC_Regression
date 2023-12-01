import React from 'react';
import styles from './CustomReadMore.module.scss';
import ReadMoreArrow from '@icons/readMoreArrow.svg';
import Arrow from '@icons/arrowCta.svg';
import ArrowHead from '@icons/arrowHead.svg';

interface ICustomReadMoreProps {
  text?: string;
}

export const CustomReadMore: React.FC<ICustomReadMoreProps> = ({ text }) => {
  return (
    <>
      <p className={styles.textWrapper}>
        <span className={styles.text}> {text}</span>
        <ReadMoreArrow className={styles.readMoreArrow} />
        <Arrow className={styles.arrow} />
        <ArrowHead className={styles.arrowHead} />
      </p>
    </>
  );
};
