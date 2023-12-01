import { makeVar } from '@apollo/client';

export type IReservationGuestInfoStorageData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  cardNumber?: string;
  cardHolderName?: string;
  cardType?: string;
  cardExpiryDate?: string;
  paymentType?: string;
  docNo?: string;
  docType?: string;
  effectiveDate: string;
  expiryDate: string;
  issueCountry: string;
  isComplete: boolean;
};

export const reservationGuestInfoStorageData = makeVar<IReservationGuestInfoStorageData | any>(
  null,
);
