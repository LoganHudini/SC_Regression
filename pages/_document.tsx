import Document, { Html, Head, Main, NextScript } from 'next/document';
import i18nextConfig from '../next-i18next.config';
import { BRAND_CODE, GA_MEASUREMENT_ID, THEME_COLOR } from 'core/graphql/endpoints';

class MyDocument extends Document {
  render() {
    const currentLocale = this.props.__NEXT_DATA__.query.locale || i18nextConfig.i18n.defaultLocale;
    return (
      <Html lang={currentLocale as string}>
        <Head>
          <script src='https://sdk.incode.com/sdk/onBoarding-1.55.0.js' defer></script>
          <script
            async
            src='https://maps.googleapis.com/maps/api/js?key=AIzaSyAX06khad_7kuvlsqG_bt3gxH_VWy5y_is&libraries=places,geometry,drawing,localContext,visualization'
          ></script>
          {GA_MEASUREMENT_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `,
                }}
              />
            </>
          )}
          <link rel='manifest' href={`/manifest.${BRAND_CODE}.json`} />
          <link rel='icon' type='image/png' href={`/${BRAND_CODE}.ico`} />
          <link rel='apple-touch-icon' type='image/png' href={`/${BRAND_CODE}.ico`} />
          <meta name='theme-color' content={THEME_COLOR} />
          <meta key='robots' name='robots' content='noindex,nofollow' />
          <meta key='googlebot' name='googlebot' content='noindex,nofollow' />
          <meta name='description' content='Feel the immersive digital experience with us' />
          <meta name='og:image' content={`/images/${BRAND_CODE}/Logo.png`} />
          <meta name='og:image:width' content='1200' />
          <meta name='og:image:height' content='630' />
          <meta name='twitter:image' content={`/images/${BRAND_CODE}/Logo.png`} />
          <meta name='twitter:image:width' content='1200' />
          <meta name='twitter:image:height' content='630' />
          <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
