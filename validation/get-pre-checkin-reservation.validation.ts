import * as yup from 'yup';

export const getPrecheckinReservationValidation = yup.object({
  confirmationNumber: yup.number().required('Required'),
  lastName: yup.string().required('Required'),
});
