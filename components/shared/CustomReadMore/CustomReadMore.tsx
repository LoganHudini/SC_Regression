import React from 'react';
import styles from './CustomReadMore.module.scss';
import ReadMoreArrow from '@icons/readMoreArrow.svg';
import Arrow from '@icons/arrowCta.svg';
import ArrowHead from '@icons/arrowHead.svg';
import cx from 'classnames';

interface ICustomReadMoreProps {
  text?: string;
  className?: any;
}

export const CustomReadMore: React.FC<ICustomReadMoreProps> = ({ text, className }) => {
  return (
    <>
      <p className={cx(styles.customReadMore, 'globals-customReadMore', className)}>
        <span className={styles.text}> {text}</span>
        <ReadMoreArrow className={styles.readMoreArrow} />
        <Arrow className={styles.arrow} />
        <ArrowHead className={styles.arrowHead} />
      </p>
    </>
  );
};
