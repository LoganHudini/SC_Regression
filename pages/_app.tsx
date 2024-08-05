/* eslint-disable camelcase */
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { client } from '../core/graphql/client';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, PickersLocaleText } from '@mui/x-date-pickers';
import { StyledEngineProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import CloseToastIcon from '@icons/closeToast.svg';
import ErrorIcon from '@icons/error.svg';
import SuccessIcon from '@icons/success.svg';
import { appWithTranslation, useTranslation } from 'next-i18next';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'normalize.css';
import '@styles/globals.scss';
import { ToastIcon } from 'react-toastify/dist/types';
import { pageView } from 'utils/gtag';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useConfig } from 'utils/hooks/useConfiguration';
import { BRAND_CODE } from 'core/graphql/endpoints';
import Head from 'next/head';
import { Notification } from 'components/shared/Notification/Notification';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from 'next-i18next.config';
import { getStaticPaths } from 'utils/getStatic';
import { setDayjsLocale } from 'storage/home.storage';

export { getStaticPaths };

const toastIconMap = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
};

const ToastErrorIcon: ToastIcon = (props) => {
  return toastIconMap[props.type as keyof typeof toastIconMap];
};

function App({ Component, pageProps }: AppProps) {
  const { t } = useTranslation(['check-in']);
  const router = useRouter();
  const widgetId = useConfig()?.widgetId;
  useEffect(() => {
    const handleRouteChange = (url: any) => {
      pageView(url, window?.document?.title || 'Home');
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  const locales: any = {
    en: import('dayjs/locale/en'),
    ar: import('dayjs/locale/ar'),
    fr: import('dayjs/locale/fr'),
    es: import('dayjs/locale/es-us'),
    ct: import('dayjs/locale/ca'),
    ja: import('dayjs/locale/ja'),
  };

  useEffect(() => {
    (async () => {
      const route: any = router?.query?.locale || 'en';
      if (route && locales[route]) {
        await locales[route];
        dayjs.locale(route);
        setDayjsLocale(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    const manifestMeta: any = document.querySelector('link[rel="manifest"]');
    if (manifestMeta && window.location.pathname) {
      manifestMeta.href = `/manifest.${BRAND_CODE}.json?start_url=${window.location.pathname}`;
      // console.log(manifestMeta.href);
    }
  }, []);

  const customLabel: Partial<PickersLocaleText<any>> = {
    okButtonLabel: t('Ok') as string,
    cancelButtonLabel: t('Cancel') as string,
  };

  return (
    <>
      <Head>
        <link rel='manifest' href={`/manifest.${BRAND_CODE}.json`} />
      </Head>
      <StyledEngineProvider injectFirst>
        <LocalizationProvider dateAdapter={AdapterDayjs} localeText={customLabel}>
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
                  <button title='toast' className='Toastify__toast__close' onClick={closeToast}>
                    <CloseToastIcon />
                  </button>
                )}
              />
              <Component {...pageProps} />
              {router?.query?.locale === 'ar' && <style>{':root {direction :rtl'}</style>}
              {widgetId && (
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      var MessageBirdChatWidgetSettings = {
                        widgetId: '${widgetId}',
                        initializeOnLoad: true,
                      };
            
                      !function () {
                        "use strict";
                        if (Boolean(document.getElementById("live-chat-widget-script"))) {
                          console.error("MessageBirdChatWidget: Snippet loaded twice on page");
                        } else {
                          var e, t;
                          window.MessageBirdChatWidget = {};
                          window.MessageBirdChatWidget.queue = [];
                          for (var i = ["init", "setConfig", "toggleChat", "identify", "hide", "on", "shutdown"], n = function () {
                              var e = i[d];
                              window.MessageBirdChatWidget[e] = function () {
                                  for (var t = arguments.length, i = new Array(t), n = 0; n < t; n++) i[n] = arguments[n];
                                  window.MessageBirdChatWidget.queue.push([[e, i]]);
                              }
                          }, d = 0; d < i.length; d++) n();
                  
                          var a = (null === (e = window) || void 0 === e || null === (t = e.MessageBirdChatWidgetSettings) || void 0 === t ? void 0 : t.widgetId) || "";
                  
                          var o = function () {
                              var e, t = document.createElement("script");
                              t.type = "text/javascript";
                              t.src = "https://livechat.messagebird.com/bootstrap.js?widgetId=".concat(a);
                              t.async = !0;
                              t.id = "live-chat-widget-script";
                              var i = document.getElementsByTagName("script")[0];
                              null == i || null === (e = i.parentNode) || void 0 === e || e.insertBefore(t, i);
                          };
                  
                          if ("complete" === document.readyState) {
                              o();
                          } else if (window.attachEvent) {
                              window.attachEvent("onload", o);
                          } else {
                              window.addEventListener("load", o, !1);
                          }
                        }
                      }();
                    `,
                  }}
                />
              )}
            </React.StrictMode>
          </ApolloProvider>
        </LocalizationProvider>
        <Notification />
      </StyledEngineProvider>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['about-your-stay', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default appWithTranslation(App);
