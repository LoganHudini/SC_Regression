import i18nextConfig from '../next-i18next.config';
import {
  ATLANTIS,
  FAIRMONT_ROYAL_PALM_MARRAKECH,
  FAIRMONT_THE_PALM_DUBAI,
  ITC_GRAND_CHOLA,
  PWA_DEMO,
  RAFFLES_THE_PALM_DUBAI,
  SOFITEL_MANILA,
} from './constants';

const propertyList = [
  PWA_DEMO,
  SOFITEL_MANILA,
  FAIRMONT_ROYAL_PALM_MARRAKECH,
  FAIRMONT_THE_PALM_DUBAI,
  ITC_GRAND_CHOLA,
  RAFFLES_THE_PALM_DUBAI,
  ATLANTIS,
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
