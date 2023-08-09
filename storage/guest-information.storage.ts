import { makeVar } from '@apollo/client';
import { IGuest } from 'types/guest-information.types';

export type IGuestStorageData = IGuest[];

export const guestInformationStorage = makeVar<IGuestStorageData | null>(null);
