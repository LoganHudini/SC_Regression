import i18nextConfig from '../next-i18next.config';

const propertyList = [
  'pwa-demo',
  'sofitel-manila',
  'fairmont-marrakech',
  'itc-grand-chola',
  'raffles-the-palm',
  'atlantis',
];

export const getI18nPaths = () =>
  i18nextConfig?.i18n?.locales
    ?.map((lng) =>
      propertyList?.map((hotel) => ({
        params: {
          locale: lng,
          hotel: hotel,
        },
      })),
    )
    .flat();

export const getStaticPaths = () => ({
  fallback: false,
  paths: getI18nPaths(),
});
