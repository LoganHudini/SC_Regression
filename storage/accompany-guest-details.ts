import { makeVar } from '@apollo/client';

export const accompanyGuestDetails = makeVar<any>([]);

export const newAccompanyGuestDetails = makeVar<any>({});

export const updateNewAccompanyGuestDetails = makeVar<any>([]);

export const primaryGuestButtonDisabled = makeVar<boolean>(false);

export const secondaryGuestButtonDisabled = makeVar<boolean>(true);

export const setNewGuestFormData = makeVar<{ configs?: any }>({
  configs: null,
});

export const IsBiometricsSkipped = makeVar<boolean>(true);
