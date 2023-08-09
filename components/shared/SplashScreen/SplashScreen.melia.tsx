/* eslint-disable @next/next/no-img-element */
import { HOTEL_CODE } from 'core/graphql/endpoints';
import React from 'react';

export const SplashScreen = () => {
  return (
    <>
      <style>{`
      .splashScreen {
        max-width: 768px;
        width: 100vw;
        min-height: 100vh;
        margin: 0 auto;
        position: fixed;
        top: 0;
        bottom: 0;
        z-index: 1000000000;
        transition: all .2s;
        background: #DDC9A3;
        overflow: auto;
        display: flex;
        flex-direction: column;
      }
      
      .hotelIcon {
        margin: 0 auto;
        max-width: 390px;
        width: 100%;
        clip-path: polygon(1% 1%, 99% 1%, 99% 99%, 1% 99%);
      }
      
      .hudiniIcon {
        margin: 77px auto 36px auto;
      }
      `}</style>
      <div className={'splashScreen'}>
        <video
          autoPlay
          muted
          loop
          className={'hotelIcon'}
          src={`/images/${HOTEL_CODE}/hotelIcon.mp4`}
        />
        <img className={'hudiniIcon'} src={`/images/${HOTEL_CODE}/hudiniIcon.png`} alt='Hudini' />
      </div>
    </>
  );
};
