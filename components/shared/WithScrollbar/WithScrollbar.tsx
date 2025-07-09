import React from 'react';
import Carousel from 'react-multi-carousel';
import { IWithScrollbarProps } from './WithScrollbar.types';
import 'react-multi-carousel/lib/styles.css';
import styles from './WithScrollbar.module.scss';

const responsive = {
  desktopLarge: {
    breakpoint: { max: 100000, min: 551 },
    items: 2,
  },
  tablet: {
    breakpoint: { max: 550, min: 465 },
    items: 1.7,
  },
  mobileLarge: {
    breakpoint: { max: 464, min: 391 },
    items: 1.5,
  },
  mobile: {
    breakpoint: { max: 390, min: 326 },
    items: 1.2,
  },
  mobileSmall: {
    breakpoint: { max: 325, min: 0 },
    items: 1,
  },
};

export const WithScrollbar: React.FC<IWithScrollbarProps> = (props) => {
  return (
    <Carousel
      ssr={true}
      containerClass={`${styles.carouselContainer}`}
      itemClass={`${props?.itemClass || styles.carouselItem}`}
      infinite={false}
      partialVisible={false}
      responsive={responsive}
      arrows={false}
      swipeable={false}
      {...props}
    />
  );
};
