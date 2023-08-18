import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { client } from '../core/graphql/client';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { StyledEngineProvider } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import CloseToastIcon from '@icons/closeToast.svg';
import ErrorIcon from '@icons/error.svg';
import SuccessIcon from '@icons/success.svg';
import { appWithTranslation } from 'next-i18next';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'normalize.css';
import '../styles/globals.scss';
import { ToastIcon } from 'react-toastify/dist/types';
import { pageView } from 'utils/gtag';
import { useRouter } from 'next/router';

const toastIconMap = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
};

const ToastErrorIcon: ToastIcon = (props) => {
  return toastIconMap[props.type as keyof typeof toastIconMap];
};

function App({ Component, pageProps }: AppProps) {
  // const [color] = useState('#d0f');
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: any) => {
      pageView(url, window?.document?.title || 'Home');
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);
  return (
    <StyledEngineProvider injectFirst>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ApolloProvider client={client}>
          <React.StrictMode>
            <ToastContainer
              autoClose={5000}
              hideProgressBar
              className='notification'
              position='top-center'
              draggable
              pauseOnHover
              closeOnClick={false}
              pauseOnFocusLoss
              limit={2}
              transition={Zoom}
              icon={ToastErrorIcon}
              closeButton={({ closeToast }) => (
                <button className='Toastify__toast__close' onClick={closeToast}>
                  <CloseToastIcon />
                </button>
              )}
            />
            {/* <style>{`:root { --custom-color: ${color}; --primary-theme-color: ${color};}`}</style> */}
            <Component {...pageProps} />
          </React.StrictMode>
        </ApolloProvider>
      </LocalizationProvider>
    </StyledEngineProvider>
  );
}

export default appWithTranslation(App);
