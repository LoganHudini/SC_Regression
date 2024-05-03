import i18nextConfig from '../next-i18next.config';
import {
  ATLANTIS,
  FAIRMONT_ROYAL_PALM_MARRAKECH,
  FAIRMONT_THE_PALM_DUBAI,
  ITC_GRAND_CHOLA,
  UAT,
  RAFFLES_THE_PALM_DUBAI,
  SOFITEL_MANILA,
  STAGE,
  ONE_HOTELS_SOUTH_BEACH,
  PROPER_DOWNTOWN_LA,
  ITC_WELCOMHOTEL_CHENNAI,
  ONE_AND_ONLY_ROYAL_MIRAGE,
} from './constants';

const propertyList = [
  STAGE,
  UAT,
  SOFITEL_MANILA,
  FAIRMONT_ROYAL_PALM_MARRAKECH,
  FAIRMONT_THE_PALM_DUBAI,
  ITC_GRAND_CHOLA,
  ITC_WELCOMHOTEL_CHENNAI,
  RAFFLES_THE_PALM_DUBAI,
  ONE_HOTELS_SOUTH_BEACH,
  ATLANTIS,
  PROPER_DOWNTOWN_LA,
  ONE_AND_ONLY_ROYAL_MIRAGE,
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
