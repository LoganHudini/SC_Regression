import * as yup from 'yup';

export const CheckinDetailsValidation = yup.object({
  lastName: yup.string().required('Last Name is a required field'),
  roomNumber: yup.string().required('Room Number is a required field'),
});

// export const CheckinDetailsValidation = yup.object({
//   lastName: yup.string().required('Last Name is a required field'),
//   roomNumber: yup.string().when('condition', {
//     is: true,
//     then: yup.string().required('Room Number is a required field'),
//     otherwise: yup.string(),
//   }),
// });
