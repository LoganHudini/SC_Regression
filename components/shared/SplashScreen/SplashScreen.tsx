import { HOTEL_CODE } from 'core/graphql/endpoints';
import React from 'react';

export const SplashScreen = () => {
  return (
    <>
      <style>{`
      .splashScreen {
        width: 100vw;
        height: 100vh;
        max-width: 768px;
        margin: 0 auto;
        position: fixed;
        top: 0;
        bottom: 0;
        z-index: 1000000000;
        min-height: 350px;
        transition: all .2s;
      }
      
      .splashScreenImage {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .hotelIcon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      
      .hudiniIcon {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 43px;
      }
      `}</style>
      <div className={'splashScreen'}>
        <img className={'splashScreenImage'} src={`/images/${HOTEL_CODE}/splashScreen.png`} />
        <img className={'hotelIcon'} src={`/images/${HOTEL_CODE}/hotelIcon.png`} />
        <img className={'hudiniIcon'} src={`/images/${HOTEL_CODE}/hudiniIcon.png`} />
      </div>
    </>
  );
};
