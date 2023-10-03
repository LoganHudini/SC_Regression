import { makeVar } from '@apollo/client';

export type ISpaStorageData = {
  selectedSpaInfoName?: string;
  selectedSpaInfoId?: string;
  selectedSpaCategoryName?: string;
  selectedSpaCategoryId?: string;
  selectedSpaTreatmentName?: string;
  selectedSpaTreatmentId?: string;
};

export const spaInformationStorage = makeVar<ISpaStorageData | null>(null);

export const spaCategoryList = makeVar([]);
