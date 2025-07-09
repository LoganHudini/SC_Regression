/* eslint-disable @next/next/next-script-for-ga */
import Document, { Html, Head, Main, NextScript } from 'next/document';
import i18nextConfig from '../next-i18next.config';
import { BRAND_CODE, THEME_COLOR } from 'core/graphql/endpoints';

class MyDocument extends Document {
  render() {
    const currentLocale = this.props.__NEXT_DATA__.query.locale || i18nextConfig.i18n.defaultLocale;
    return (
      <Html lang={currentLocale as string}>
        <Head>
          <script src='/gtm/gtm-script.js' async></script>
          <link rel='icon' type='image/png' href={`/${BRAND_CODE}.ico`} />
          <link rel='apple-touch-icon' type='image/png' href={`/${BRAND_CODE}.ico`} />
          <meta name='theme-color' content={THEME_COLOR} />
          <meta key='robots' name='robots' content='noindex,nofollow' />
          <meta key='googlebot' name='googlebot' content='noindex,nofollow' />
          <meta name='description' content='Feel the immersive digital experience with us' />
          <meta name='og:image' content={`/images/${BRAND_CODE}/Logo.png`} />
          <meta name='og:image:width' content='1920' />
          <meta name='og:image:height' content='1080' />
          <meta name='twitter:image' content={`/images/${BRAND_CODE}/Logo.png`} />
          <meta name='twitter:image:width' content='1920' />
          <meta name='twitter:image:height' content='1080' />
        </Head>
        <body>
          <Main />
          <NextScript />
          <style>
            {`
              #live-chat-widget {
                margin-bottom: 64px !important;
                position: fixed !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 100 !important;
              }
            `}
          </style>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
