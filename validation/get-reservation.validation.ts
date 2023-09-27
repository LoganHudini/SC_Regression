import * as yup from 'yup';

export const getReservationValidation = yup.object({
  confirmationNumber: yup.string().required('Booking ID is a required field'),
  lastName: yup.string().required('Last Name is a required field'),
});
