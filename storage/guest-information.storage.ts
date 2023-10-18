import { makeVar } from '@apollo/client';
import { IGuest } from 'types/guest-information.types';

export type IGuestStorageData = IGuest[];

export type DocTypeData = { name: string; value: string }[];

export const guestInformationStorage = makeVar<IGuestStorageData | null>(null);

export const docTypeStorage = makeVar<DocTypeData | null>([]);
