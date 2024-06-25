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
  expiryDate: string;
  issueCountry: string;
  isComplete: boolean;
  dateOfBirth?: string;
  issueDate?: string;
  roomStatus?: boolean;
};

export const reservationGuestInfoStorageData = makeVar<IReservationGuestInfoStorageData | any>(
  null,
);
