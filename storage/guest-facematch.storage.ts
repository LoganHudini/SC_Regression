import { makeVar } from '@apollo/client';

export type IGuestFaceMatchStorageData = {
  faceMatch?: boolean;
  checked?: boolean;
};

export const guestFaceMatchStorageData = makeVar<IGuestFaceMatchStorageData>({
  faceMatch: false,
  checked: false,
});
