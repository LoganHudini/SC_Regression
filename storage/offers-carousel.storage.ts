import { makeVar } from '@apollo/client';

export type IOfferStorageData = {
  selectedOfferInfoName?: string;
  selectedOfferInfoId?: string;
  selectedOfferCategoryName?: string;
  selectedOfferCategoryId?: string;
};

export const offerInformationStorage = makeVar<IOfferStorageData | null>(null);
