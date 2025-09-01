import { makeVar } from '@apollo/client';

export type ISelectedPreferences = { [groupId: string]: string[] };

export const selectedPreferencesStorage = makeVar<ISelectedPreferences>({});

export const updateSelectedPreferences = (preferences: ISelectedPreferences) => {
  selectedPreferencesStorage(preferences);
};

export const clearSelectedPreferences = () => {
  selectedPreferencesStorage({});
};
