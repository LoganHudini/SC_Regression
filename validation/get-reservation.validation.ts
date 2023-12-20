import * as yup from 'yup';

export const getReservationForCheckinValidation = yup.object({
  confirmationNumber: yup.string().required('Booking ID is a required field'),
  lastName: yup.string().required('Last Name is a required field'),
});

export const getReservationForConnectToRoomValidation = yup.object({
  roomNo: yup.string().required('Room Number is a required field'),
  lastName: yup.string().required('Last Name is a required field'),
});
