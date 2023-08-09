import * as yup from 'yup';

export const getReservationValidation = yup.object({
  confirmationNumber: yup.number().required('Reservation ID is a required field'),
  lastName: yup.string().required('Last name is a required field'),
});
