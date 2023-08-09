import React from 'react';
import cx from 'classnames';
import styles from './HousekeepingCarouselSkeleton.module.scss';

export const HouseKeepingCarouselSkeleton: React.FC = () => {
  return <div className={cx(styles.carouselWrapper, styles.animation)} />;
};
