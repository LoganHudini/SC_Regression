/* eslint-disable @next/next/no-img-element */
import { RotatingLines } from 'react-loader-spinner';
import React from 'react';
import styles from './Loaders.module.scss';
import { Player } from '@lottiefiles/react-lottie-player';
import ItemNotFoundAnimation from '@jsons/itemsNotFound.json';
import successAnimation from '@jsons/success.json';
import { HOTEL_CODE } from 'core/graphql/endpoints';

export const LogoLoader = () => {
  return (
    <div className={styles.loaderOverlay}>
      {/* <Player
        autoplay
        loop
        src={`/jsons/${HOTEL_CODE}/logoLoader.json`}
        className={styles.logoLoader}
      /> */}
      <img src={`/images/${HOTEL_CODE}/logo.png`} alt='loader' className={styles.logoLoader} />
    </div>
  );
};

export const MultiPurposeLoader = () => {
  return (
    <div className={styles.loaderOverlay}>
      <Player
        autoplay
        loop
        src={`/jsons/${HOTEL_CODE}/multiPurpose.json`}
        className={styles.multipurposeLoader}
      />
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

export const LineLoader = () => {
  return (
    <div className={styles.loaderOverlay}>
      <RotatingLines
        strokeColor='var(--primary-theme-color)'
        strokeWidth='5'
        width='100'
        visible={true}
      />
    </div>
  );
};

export const ItemNotFoundAnimationLoader = () => (
  <Player autoplay loop src={ItemNotFoundAnimation} className={styles.itemNotFoundAnimation} />
);

export const SuccessAnimation = () => <Player autoplay loop src={successAnimation} />;
