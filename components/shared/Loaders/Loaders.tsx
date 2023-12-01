/* eslint-disable @next/next/no-img-element */
import React from 'react';
import styles from './Loaders.module.scss';
import { Player } from '@lottiefiles/react-lottie-player';
import ItemNotFound from '@jsons/itemsNotFound.json';
import Carousel from '@jsons/carousel.json';
import Image from '@jsons/image.json';
import Failure from '@jsons/failure.json';
import PageNotFound from '@jsons/pageNotFound.json';
import { BRAND_CODE } from 'core/graphql/endpoints';

export const LogoLoader = () => {
  return (
    <div className={styles.loaderOverlay}>
      <img src={`/images/${BRAND_CODE}/Logo.png`} alt='loader' className={styles.logoLoader} />
    </div>
  );
};

export const Loader = () => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loader}></div>
    </div>
  );
};

export const MultiPurposeLoader = () => {
  return (
    <div className={styles.loaderOverlay}>
      <Player
        autoplay
        loop
        src={`/jsons/${BRAND_CODE}/multiPurpose.json`}
        className={styles.multipurposeLoader}
      />
    </div>
  );
};

export const ItemNotFoundLoader = () => (
  <Player autoplay loop src={ItemNotFound} className={styles.itemNotFoundAnimation} />
);

export const CarouselLoader = () => {
  return <Player autoplay loop src={Carousel} className={styles.carouselAnimation} />;
};

export const ImageLoader: React.FC<unknown> = (props) => {
  return <Player autoplay loop src={Image} {...{ props }} />;
};

export const SuccessAnimation = () => (
  <Player autoplay loop src={`/jsons/${BRAND_CODE}/success.json`} />
);

export const FailureAnimation = () => (
  <Player autoplay loop src={Failure} className={styles.errorAnimation} />
);

export const PageNotFoundAnimation = () => <Player autoplay loop src={PageNotFound} />;
