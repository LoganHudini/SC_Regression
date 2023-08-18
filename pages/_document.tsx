import Document, { Html, Head, Main, NextScript } from 'next/document';
import i18nextConfig from '../next-i18next.config';
import { GA_MEASUREMENT_ID, HOTEL_CODE, THEME_COLOR } from 'core/graphql/endpoints';

class MyDocument extends Document {
  render() {
    const currentLocale = this.props.__NEXT_DATA__.query.locale || i18nextConfig.i18n.defaultLocale;
    return (
      <Html lang={currentLocale as string}>
        <Head>
          <script src='https://sdk.incode.com/sdk/onBoarding-1.55.0.js' defer></script>
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
          <link rel='manifest' href={`/manifest.${HOTEL_CODE}.json`} />
          <link rel='icon' type='image/png' href={`${HOTEL_CODE}.ico`} />
          <link rel='apple-touch-icon' type='image/png' href={`${HOTEL_CODE}.ico`} />
          <meta name='theme-color' content={THEME_COLOR} />
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
