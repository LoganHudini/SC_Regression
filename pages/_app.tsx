/* eslint-disable camelcase */
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { client } from '../core/graphql/client';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { StyledEngineProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import CloseToastIcon from '@icons/closeToast.svg';
import ErrorIcon from '@icons/error.svg';
import SuccessIcon from '@icons/success.svg';
import { appWithTranslation } from 'next-i18next';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'normalize.css';
import '@styles/globals.scss';
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

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker: any = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Trigger an event to notify the application of an update
                  const updateEvent = new Event('swUpdate');
                  document.dispatchEvent(updateEvent);
                  console.log('Update Performed!');
                } else {
                  console.log('Content is now available offline!');
                }
              }
            };
          };
        } catch (error) {
          console.error('Error registering Service Worker:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      // Display a notification or UI indicating an update is available
      // Prompt the user to reload the page or automatically reload
      window.location.reload();
    };

    document.addEventListener('swUpdate', handleUpdate);

    return () => {
      document.removeEventListener('swUpdate', handleUpdate);
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
            <Component {...pageProps} />
          </React.StrictMode>
        </ApolloProvider>
      </LocalizationProvider>
    </StyledEngineProvider>
  );
}

export default appWithTranslation(App);
