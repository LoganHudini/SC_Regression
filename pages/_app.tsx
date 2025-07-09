/* eslint-disable camelcase */
import type { AppProps } from 'next/app';
import { ApolloProvider, useReactiveVar } from '@apollo/client';
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
import { checkinStorage } from 'storage/check-in.storage';

export { getStaticPaths };
declare global {
  interface Window {
    ChatWidgetConfig: any;
  }
}

declare global {
  interface Window {
    ChatWidgetConfig: any;
  }
}

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
  const config = useConfig();
  const widgetId = config?.widgetId;
  const checkinData = useReactiveVar(checkinStorage);
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
    de: import('dayjs/locale/de'),
  };

  const hotelCode = router?.asPath?.split('/')[2];
  const lang = router?.asPath?.split('/')[1];

  useEffect(() => {
    if (!hotelCode || !lang) return;
    const updateManifest = async () => {
      try {
        const response = await fetch(`/manifest.${BRAND_CODE}.json`);
        if (!response.ok) throw new Error('Failed to load manifest');
        const manifest = await response.json();
        const startUrl = `/${lang}/${hotelCode}`?.replace(/\/+/g, '/');
        if (!startUrl || startUrl === '/') {
          return;
        }

        const updatedManifest = {
          ...manifest,
          start_url: startUrl,
          id: startUrl,
          scope: '/',
        };

        const blob = new Blob([JSON.stringify(updatedManifest)], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);

        const oldManifest = document.querySelector('link[rel="manifest"]');
        if (oldManifest) {
          document.head.removeChild(oldManifest);
        }

        const newManifest = document.createElement('link');
        newManifest.rel = 'manifest';
        newManifest.href = blobUrl;

        document.head.appendChild(newManifest);

        navigator.serviceWorker?.getRegistration().then((reg) => reg?.update());
      } catch (error) {
        console.error('err update manifest', error);
      }
    };

    updateManifest();

    return () => {
      const manifestElement = document.querySelector('link[rel="manifest"]') as any;
      if (manifestElement?.href?.startsWith('blob:')) {
        URL.revokeObjectURL(manifestElement.href);
      }
    };
  }, [hotelCode, lang]);

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

  const customLabel: Partial<PickersLocaleText<any>> = {
    okButtonLabel: t('Ok') as string,
    cancelButtonLabel: t('Cancel') as string,
  };

  useEffect(() => {
    if (config?.hotelId && config?.chatOption === 'HUDINI-CHAT') {
      window.ChatWidgetConfig = {
        hotelId: config?.hotelId,
        themeColor: {
          icon: { background: 'var(--primary-theme-color)' },
          header: {
            background: '#fff',
            color: 'var(--primary-theme-color)',
            closeBtn: { color: 'var(--primary-theme-color)' },
          },
          body: {
            background: '#F8F8F8',
            chatBubbleStaff: {
              background: '#f0f2f5',
            },
            chatBubbleGuest: {
              background: 'var(--primary-theme-color)',
            },
            sentButton: {
              color: 'var(--primary-theme-color)',
            },
          },
        },
        channelId: 'PWA',
        roomNumber: checkinData?.roomNumber || '',
        userName:
          checkinData?.firstName || checkinData?.lastName
            ? `${checkinData?.firstName ?? ''} ${checkinData?.lastName ?? ''}`.trim()
            : 'Unknown',
        reservationId: '',
        confirmationId: checkinData?.reservationId,
        title: 'COMO',
        customInset: {
          bottom: '80px',
          right: '30px',
        },
        // svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" width="117" height="17.902" viewBox="0 0 117 17.902">
        //   <g id="logo" transform="translate(427.571 -355.336)">
        //     <path id="Path_69109" data-name="Path 69109" d="M-409.681,378.029v-1.657h-3.046v1.657h-.447V374.48h.447V376h3.046V374.48h.447v3.549Z" transform="translate(-4.107 -4.867)" fill="#291f1d"/>
        //     <g id="Group_104683" data-name="Group 104683" transform="translate(-427.571 355.336)">
        //       <g id="Group_104911" data-name="Group 104911" transform="translate(0 0)">
        //         <path id="Path_69110" data-name="Path 69110" d="M-402.143,378.091c-1.6,0-2.2-.677-2.2-1.85s.606-1.837,2.2-1.837,2.191.663,2.191,1.837-.6,1.85-2.191,1.85m0-3.317c-1.242,0-1.734.459-1.734,1.467s.492,1.471,1.734,1.471,1.724-.473,1.724-1.471-.477-1.467-1.724-1.467" transform="translate(421.897 -360.189)" fill="#291f1d"/>
        //         <path id="Path_69111" data-name="Path 69111" d="M-393.577,374.863v3.166h-.442v-3.166h-1.72l.015-.383h3.861l.01.383Z" transform="translate(420.37 -360.203)" fill="#291f1d"/>
        //         <path id="Path_69112" data-name="Path 69112" d="M-383.855,377.659l-.015.369h-3.409v-3.549H-384l.015.373h-2.852v1.165h2.464v.322h-2.464v1.32Z" transform="translate(418.869 -360.202)" fill="#291f1d"/>
        //         <path id="Path_69113" data-name="Path 69113" d="M-375.994,377.64l-.015.388h-3.21v-3.549h.442v3.161Z" transform="translate(417.439 -360.202)" fill="#291f1d"/>
        //         <path id="Path_69114" data-name="Path 69114" d="M-370.281,378.09a3.549,3.549,0,0,1-1.555-.336l.069-.374a3.228,3.228,0,0,0,1.5.346c.844,0,1.282-.327,1.282-.72,0-.927-2.8-.308-2.8-1.59,0-.492.463-1.018,1.645-1.018a4,4,0,0,1,1.421.238l-.07.355a4.144,4.144,0,0,0-1.346-.228c-.9,0-1.223.356-1.223.63,0,.889,2.8.251,2.8,1.585,0,.61-.582,1.112-1.719,1.112" transform="translate(416.129 -360.188)" fill="#291f1d"/>
        //         <path id="Path_69115" data-name="Path 69115" d="M-356.438,378.181a11.023,11.023,0,0,1-1.038-.5,2.1,2.1,0,0,1-1.381.5c-.879,0-1.188-.435-1.188-.837,0-.488.373-.762.805-.97a1.074,1.074,0,0,1-.3-.658c0-.354.253-.724.979-.724.646,0,.994.294.994.554,0,.321-.3.515-.675.681-.16.072-.333.137-.5.208a6.516,6.516,0,0,0,1.223.847,1.667,1.667,0,0,0,.457-.837h.327a1.88,1.88,0,0,1-.5.993c.3.157.611.3.92.421Zm-1.342-.667a6.587,6.587,0,0,1-1.272-.927c-.332.174-.587.392-.587.742s.358.54.835.54a1.744,1.744,0,0,0,1.023-.355m-1.152-1.268c.2-.08.407-.156.571-.236.234-.113.4-.242.4-.422s-.229-.317-.621-.317c-.358,0-.606.18-.606.46a.839.839,0,0,0,.258.515" transform="translate(414.037 -360.294)" fill="#291f1d"/>
        //         <path id="Path_69116" data-name="Path 69116" d="M-345.506,376.438l-.006.01.268.284,1.2,1.3h-.561l-1.307-1.5h-1.416v1.5h-.448V374.48h1.893c1.034,0,1.5.392,1.5,1,0,.526-.383.908-1.118.96m-.388-1.608h-1.435v1.382h1.376c.775,0,1.1-.266,1.1-.715,0-.416-.3-.667-1.044-.667" transform="translate(411.861 -360.203)" fill="#291f1d"/>
        //         <path id="Path_69117" data-name="Path 69117" d="M-336.042,377.659l-.015.369h-3.408v-3.549h3.279l.015.373h-2.852v1.165h2.464v.322h-2.464v1.32Z" transform="translate(410.386 -360.202)" fill="#291f1d"/>
        //         <path id="Path_69118" data-name="Path 69118" d="M-330.058,378.09a3.549,3.549,0,0,1-1.555-.336l.069-.374a3.228,3.228,0,0,0,1.5.346c.845,0,1.282-.327,1.282-.72,0-.927-2.8-.308-2.8-1.59,0-.492.462-1.018,1.644-1.018a4,4,0,0,1,1.421.238l-.069.355a4.156,4.156,0,0,0-1.347-.228c-.9,0-1.222.356-1.222.63,0,.889,2.8.251,2.8,1.585,0,.61-.582,1.112-1.719,1.112" transform="translate(408.993 -360.188)" fill="#291f1d"/>
        //         <path id="Path_69119" data-name="Path 69119" d="M-321.9,378.091c-1.6,0-2.2-.677-2.2-1.85s.606-1.837,2.2-1.837,2.191.663,2.191,1.837-.6,1.85-2.191,1.85m0-3.317c-1.241,0-1.734.459-1.734,1.467s.493,1.471,1.734,1.471,1.724-.473,1.724-1.471-.477-1.467-1.724-1.467" transform="translate(407.661 -360.189)" fill="#291f1d"/>
        //         <path id="Path_69120" data-name="Path 69120" d="M-312.58,376.438l-.006.01.269.284,1.2,1.3h-.562l-1.307-1.5H-314.4v1.5h-.447V374.48h1.893c1.033,0,1.5.392,1.5,1,0,.526-.382.908-1.118.96m-.387-1.608H-314.4v1.382h1.376c.775,0,1.1-.266,1.1-.715,0-.416-.3-.667-1.043-.667" transform="translate(406.019 -360.203)" fill="#291f1d"/>
        //         <path id="Path_69121" data-name="Path 69121" d="M-305.217,374.863v3.166h-.442v-3.166h-1.72l.016-.383h3.86l.01.383Z" transform="translate(404.693 -360.203)" fill="#291f1d"/>
        //         <path id="Path_69122" data-name="Path 69122" d="M-297.837,378.09a3.549,3.549,0,0,1-1.555-.336l.069-.374a3.226,3.226,0,0,0,1.5.346c.844,0,1.282-.327,1.282-.72,0-.927-2.8-.308-2.8-1.59,0-.492.462-1.018,1.644-1.018a4,4,0,0,1,1.421.238l-.07.355a4.146,4.146,0,0,0-1.346-.228c-.9,0-1.223.356-1.223.63,0,.889,2.8.251,2.8,1.585,0,.61-.582,1.112-1.719,1.112" transform="translate(403.276 -360.188)" fill="#291f1d"/>
        //         <path id="Path_69123" data-name="Path 69123" d="M-292.547,364.918a30.374,30.374,0,0,0,.183-3.081c0-1.967-.292-3.864-.292-4.177h-.962c0,.313-.292,2.21-.292,4.177s.292,3.865.292,4.179h8.314v-1.1Z" transform="translate(402.303 -357.218)" fill="#291f1d"/>
        //         <path id="Path_69124" data-name="Path 69124" d="M-316.062,364.918c.072-.7.158-1.643.178-2.637h5.394v-1.1h-5.4c-.028-.917-.106-1.78-.174-2.427h7.578v-1.1h-8.647c0,.313-.293,2.21-.293,4.177s.293,3.865.293,4.179h8.857v-1.1Z" transform="translate(406.475 -357.218)" fill="#291f1d"/>
        //         <path id="Path_69125" data-name="Path 69125" d="M-330.909,357.659h-9.776v1.1h4.3a30.379,30.379,0,0,0-.183,3.081c0,1.967.292,3.864.292,4.177h.96c0-.313.294-2.21.294-4.177a30.091,30.091,0,0,0-.184-3.081h4.3Z" transform="translate(410.602 -357.218)" fill="#291f1d"/>
        //         <path id="Path_69126" data-name="Path 69126" d="M-353.159,366.015c0-.313.293-2.21.293-4.179s-.293-3.864-.293-4.177h-.961c0,.313-.292,2.21-.292,4.177s.292,3.865.292,4.179Z" transform="translate(413.038 -357.218)" fill="#291f1d"/>
        //         <path id="Path_69127" data-name="Path 69127" d="M-368.189,358.756v-1.1H-376.5c0,.314-.293,2.211-.293,4.179s.293,3.864.293,4.177h.96c0-.284.24-1.869.285-3.628h4.811v-1.1h-4.811c-.024-.957-.106-1.86-.176-2.533Z" transform="translate(417.009 -357.218)" fill="#291f1d"/>
        //         <path id="Path_69128" data-name="Path 69128" d="M-397.366,357.123c-1.62,0-5.631,3.281-5.631,4.619s4.011,4.62,5.631,4.62,5.63-3.282,5.63-4.62-4.011-4.619-5.63-4.619m0,7.89c-1.436,0-4.111-2.224-4.111-3.271s2.675-3.271,4.111-3.271,4.11,2.224,4.11,3.271-2.674,3.271-4.11,3.271" transform="translate(421.658 -357.123)" fill="#291f1d"/>
        //         <path id="Path_69129" data-name="Path 69129" d="M-417.394,362.086c-1.968-1.22-6.531-1.336-6.531-2.508,0-.613,1.43-1.2,3.082-1.143a6.367,6.367,0,0,1,3.384,1.143l.661-.965a7.963,7.963,0,0,0-4.235-1.234c-2.867-.05-4.463,1.366-4.463,2.282,0,.744.925,1.412,1.685,1.725,2.765,1.142,5.812,1.122,5.812,2.3,0,.67-1.291,1.437-3.074,1.407a6.833,6.833,0,0,1-3.908-1.4l-.7,1.022a8.616,8.616,0,0,0,4.609,1.482,5.836,5.836,0,0,0,3.826-1.094,2.114,2.114,0,0,0,.929-1.532,2.028,2.028,0,0,0-1.075-1.484" transform="translate(425.683 -357.168)" fill="#291f1d"/>
        //       </g>
        //     </g>
        //   </g>
        // </svg>
        // `,
      };

      // Create the script tag dynamically
      const script = document.createElement('script');
      // script.src = 'https://chat.hudinielevate-dev.io/chat-widget.js';
      script.src = 'https://chat.hudinielevate-stage.io/chat-widget.js';
      // script.src = 'http://localhost:3001/chat-widget.js';
      script.async = true;

      document.body.appendChild(script);

      // Cleanup (optional)
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [
    checkinData?.firstName,
    checkinData?.lastName,
    checkinData?.reservationId,
    checkinData?.roomNumber,
    config?.chatOption,
    config?.hotelId,
  ]);

  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          media='(device-width: 360px)'
        />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          media='(device-width: 320px)'
        />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          media='(device-width: 375px)'
        />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='theme-color' content='#ffffff' />
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
