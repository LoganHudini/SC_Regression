import * as yup from 'yup';

export const TableReservationValidation = yup.object({
  // tableNo: yup.number().required('Table number is a required field'),
  name: yup.string().required('Name is a required field'),
  roomNumber: yup.string().required('Room number is a required field'),
  phoneNumber: yup
    .string()
    .matches(
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
      'Please enter valid phone number',
    ),
});

export const TableReservationValidationWithoutRoomNumber = yup.object({
  // tableNo: yup.number().required('Table number is a required field'),
  name: yup.string().required('Name is a required field'),
  phoneNumber: yup
    .string()
    .matches(
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
      'Please enter valid phone number',
    ),
});
