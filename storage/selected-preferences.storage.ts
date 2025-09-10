import { makeVar } from '@apollo/client';

export interface ISelectedPrefDisplay {
  groupName: string;
  items: string[];
}

export const selectedPreferencesDisplayStorage = makeVar<ISelectedPrefDisplay[]>([]);
