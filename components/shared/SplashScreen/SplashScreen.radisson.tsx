import { HOTEL_CODE } from 'core/graphql/endpoints';
import React from 'react';

export const SplashScreen = () => {
  return (
    <>
      <style>{`
      .splashScreen {
        display: none;
      }
      `}</style>
      <div className={'splashScreen'} />
    </>
  );
};
