import React from 'react';
import styles from './CustomReadMore.module.scss';
import ReadMoreArrow from '@icons/readMoreArrow.svg';
import Arrow from '@icons/arrowCta.svg';
import ArrowHead from '@icons/arrowHead.svg';
import cx from 'classnames';
import { useRouter } from 'next/router';

interface ICustomReadMoreProps {
  text?: string;
  className?: any;
}

export const CustomReadMore: React.FC<ICustomReadMoreProps> = ({ text, className }) => {
  const router = useRouter();
  const isTransform = router?.query?.locale === 'ar';
  return (
    <>
      <p className={cx(styles.customReadMore, 'globals-customReadMore', className)}>
        <span className={styles.text}>{text}</span>
        <ReadMoreArrow className={cx(styles.readMoreArrow, { [styles.transform]: isTransform })} />
        <Arrow className={cx(styles.arrow, { [styles.transform]: isTransform })} />
        <ArrowHead className={cx(styles.arrowHead, { [styles.transform]: isTransform })} />
      </p>
    </>
  );
};
