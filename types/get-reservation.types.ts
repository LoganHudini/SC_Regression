export interface IGetReservationData {
  confirmationNumber: string;
  lastName: string;
}

export interface IGetPrecheckinReservationData {
  confirmationNumber: string | string[];
  lastName: string | string[];
}

export interface IGetReservationDataValidation {
  lastName: string;
  roomNumber: number | string;
  reservationId: number | string;
}
