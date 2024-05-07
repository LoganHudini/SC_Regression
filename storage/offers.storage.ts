import { makeVar } from '@apollo/client';
export const offerList = makeVar([]);
export const selectedOfferOption = makeVar({});
export const offerDetailDrawerStatus = makeVar(false);
export const selectedOfferDetails = makeVar({});

export type IOfferStorageData = {
  selectedOfferInfoName?: string;
  selectedOfferInfoId?: string;
  selectedOfferCategoryName?: string;
  selectedOfferCategoryId?: string;
};

export const offerInformationStorage = makeVar<IOfferStorageData | null>(null);
